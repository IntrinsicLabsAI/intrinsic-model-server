import { createListenerMiddleware, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createDefaultClient } from "../api/services/completion";

// Model Slice
export type ExperimentId = string;

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
    output: string;
    active: boolean;
    failed?: boolean;
}

export interface ModelState {
    currentExperiments: ExperimentState[];
}

const initialState: Record<string, ModelState> = {};

export const modelSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        addActiveExperiment: (state, action: PayloadAction<Experiment>) => {
            if (!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                state[action.payload.modelId] = { currentExperiments: [] };
            }

            state[action.payload.modelId].currentExperiments.unshift({
                experiment: action.payload,
                active: true,
                output: "",
            });
        },
        addCompletedExperiment: (state, action: PayloadAction<ExperimentState>) => {
            const { experiment, output } = action.payload;
            if (!Object.prototype.hasOwnProperty.call(state, experiment.modelId)) {
                state[experiment.modelId] = { currentExperiments: [] };
            }

            state[experiment.modelId].currentExperiments.unshift({
                experiment,
                output,
                active: false,
            });
        },
        removeExperiment: (
            state,
            action: PayloadAction<{ modelId: string; experimentId: string }>
        ) => {
            const { modelId, experimentId } = action.payload;
            const experiments = state[modelId] ?? [];
            const removed = experiments.currentExperiments.filter(
                (experiment) => experiment.experiment.id !== experimentId
            );
            experiments.currentExperiments = removed;
        },
        addOutputToken: (
            state,
            action: PayloadAction<{ modelId: string; id: ExperimentId; token: string }>
        ) => {
            // Prevent taking new output tokens if modelId is not known to system
            if (!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                return;
            }
            const { id, token } = action.payload;
            const experiment = state[action.payload.modelId].currentExperiments.find(
                (ex) => ex.experiment.id == id
            );
            // Prevent taking new output tokens after experiment is no longer active. This probably shoudln't happen anyway...
            if (experiment === undefined || !experiment.active) {
                return;
            }
            experiment.output += token;
        },
        completeExperiment: (
            state,
            action: PayloadAction<{ modelId: string; id: ExperimentId }>
        ) => {
            // Prevents running action if modelId is not known to system
            if (!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                return;
            }
            const experiment = state[action.payload.modelId].currentExperiments.find(
                (ex) => ex.experiment.id === action.payload.id
            );

            if (experiment === undefined || !experiment.active) {
                return;
            }

            experiment.active = false;
        },
        failExperiment: (state, action: PayloadAction<{ modelId: string; id: ExperimentId }>) => {
            // Prevents running action if modelId is not known to system
            if (!Object.prototype.hasOwnProperty.call(state, action.payload.modelId)) {
                return;
            }

            const experiment = state[action.payload.modelId].currentExperiments.find(
                (ex) => ex.experiment.id === action.payload.id
            );
            if (experiment === undefined || !experiment.active) {
                return;
            }

            // End experiment and mark as failed
            experiment.active = false;
            experiment.failed = true;
        },
        // Add an experiment that's already been completed
    },
});

export const {
    addActiveExperiment,
    addCompletedExperiment,
    addOutputToken,
    completeExperiment,
    removeExperiment,
    failExperiment,
} = modelSlice.actions;

// TODO(aduffy): move to own file?
export const wsMiddleware = createListenerMiddleware();

wsMiddleware.startListening({
    actionCreator: addActiveExperiment,
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
                            listenerApi.dispatch(completeExperiment({ modelId, id }));
                            resolve(undefined);
                        }
                    );
                });
            } catch (e) {
                console.error(e);
                listenerApi.dispatch(failExperiment({ modelId, id }));
            }
        }

        await startWebSocket();
    },
});
