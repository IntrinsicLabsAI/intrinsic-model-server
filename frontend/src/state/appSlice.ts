import { createListenerMiddleware, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createDefaultClient } from "../api/services/completion";
import { SavedExperimentOut } from "../api";


export type ExperimentId = number;

export interface Experiment {
    id: ExperimentId;
    model: string;
    modelId: string;
    version: string;
    temperature: number;
    tokenLimit: number;
    prompt: string;
}

export interface ExperimentState {
    experiment: Experiment;
    type?: string;
    output: string;
    active: boolean;
    failed?: boolean;
}

export interface ModelState {
    experiments: ExperimentState[],
    saved_experiments: ExperimentState[]
}

const initialState: Record<string, ModelState> = { };

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        startActiveExperiment: (state, action: PayloadAction<Experiment>) => {
            if(!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                state[action.payload.modelId] = { experiments: [], saved_experiments: [] }
            }

            state[action.payload.modelId].experiments.unshift({
                experiment: action.payload,
                active: true,
                output: "",
            });
        },
        addOutputToken: (state, action: PayloadAction<{ modelId: string, id: ExperimentId, token: string }>) => {
            // Prevent taking new output tokens if modelId is not known to system
            if(!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                return;
            }
            const { id, token } = action.payload;
            const experiment = state[action.payload.modelId].experiments.find(ex => ex.experiment.id == id);
            // Prevent taking new output tokens after experiment is no longer active. This probably shoudln't happen anyway...
            if (experiment === undefined || !experiment.active) {
                return;
            }
            experiment.output += token;
        },
        completeExperiment: (state, action: PayloadAction<{modelId: string, id: ExperimentId}>) => {
            // Prevents running action if modelId is not known to system
            if(!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                return;
            }
            const experiment = state[action.payload.modelId].experiments.find(ex => ex.experiment.id === action.payload.id);

            if (experiment === undefined || !experiment.active) {
                return;
            }

            experiment.active = false;
        },
        failExperiment: (state, action: PayloadAction<{modelId: string, id: ExperimentId}>) => {
            // Prevents running action if modelId is not known to system
            if(!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                return;
            }

            const experiment = state[action.payload.modelId].experiments.find(ex => ex.experiment.id === action.payload.id);
            if (experiment === undefined || !experiment.active) {
                return;
            }

            // End experiment and mark as failed
            experiment.active = false;
            experiment.failed = true;
        },
        addSavedExperiments: (state, action: PayloadAction<{modelName: string, modelID: string, experiments: SavedExperimentOut[]}>) => {
            if(!Object.prototype.hasOwnProperty.call(state, action.payload.modelID)) {
                state[action.payload.modelID] = { experiments: [], saved_experiments: [] }
            }

            action.payload.experiments.forEach((exResponse) => {
                state[action.payload.modelID].saved_experiments.push({
                    experiment: {
                        id: Number(exResponse.experiment_id),
                        model: action.payload.modelName,
                        modelId: exResponse.model_id,
                        version: exResponse.model_version,
                        temperature: exResponse.temperature,
                        tokenLimit: exResponse.tokens,
                        prompt: exResponse.prompt
                    },
                    type: "saved",
                    active: false,
                    failed: false,
                    output: exResponse.output,
                })
            })

            console.log(state[action.payload.modelID].saved_experiments)
        },
    }
});

export const { startActiveExperiment, addOutputToken, completeExperiment, failExperiment, addSavedExperiments } = appSlice.actions;

// TODO(aduffy): move to own file?
export const wsMiddleware = createListenerMiddleware();

wsMiddleware.startListening({
    actionCreator: startActiveExperiment,
    effect: async (action, listenerApi) => {
        const experiment = action.payload;
        const { id, model, modelId, version } = action.payload;
        const client = createDefaultClient(model, version);

        async function startWebSocket() {
            try {
                await client.connect();
                await new Promise((resolve) => {
                    client.completeAsync(
                        {
                            prompt: experiment.prompt,
                            temperature: experiment.temperature,
                            tokens: experiment.tokenLimit,
                        },
                        (token) => listenerApi.dispatch(addOutputToken({ modelId, id, token })),
                        () => {
                            listenerApi.dispatch(completeExperiment({modelId, id}));
                            resolve(undefined);
                        },
                    )
                });
            } catch (e) {
                console.error(e);
                listenerApi.dispatch(failExperiment({modelId, id}));
            }
        }

        await startWebSocket();
    },
});
