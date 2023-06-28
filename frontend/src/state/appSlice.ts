import { createListenerMiddleware, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createDefaultClient } from "../api/services/completion";


export type ExperimentId = number;

export interface Experiment {
    id: ExperimentId;
    model: string;
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

export interface AppState {
    // Set of visible experiments
    experiments: ExperimentState[],
}

const initialState: AppState = {
    experiments: [],
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        // Ad to specific experiment output token
        startActiveExperiment: (state, action: PayloadAction<Experiment>) => {
            state.experiments.unshift({
                experiment: action.payload,
                active: true,
                output: "",
            });
        },
        addOutputToken: (state, action: PayloadAction<{ id: ExperimentId, token: string }>) => {
            const { id, token } = action.payload;
            const experiment = state.experiments.find(ex => ex.experiment.id == id);
            // Prevent taking new output tokens after experiment is no longer active. This probably shoudln't happen anyway...
            if (experiment === undefined || !experiment.active) {
                return;
            }
            experiment.output += token;
        },
        completeExperiment: (state, action: PayloadAction<ExperimentId>) => {
            const experiment = state.experiments.find(ex => ex.experiment.id === action.payload);
            if (experiment === undefined || !experiment.active) {
                return;
            }

            experiment.active = false;
        },
        failExperiment: (state, action: PayloadAction<ExperimentId>) => {
            const experiment = state.experiments.find(ex => ex.experiment.id === action.payload);
            if (experiment === undefined || !experiment.active) {
                return;
            }

            experiment.active = false;
            experiment.failed = true;
        },       
    },
});

export const { startActiveExperiment, addOutputToken, completeExperiment, failExperiment } = appSlice.actions;

// TODO(aduffy): move to own file?
export const wsMiddleware = createListenerMiddleware();
wsMiddleware.startListening({
    actionCreator: startActiveExperiment,
    effect: async (action, listenerApi) => {
        const experiment = action.payload;
        const { id, model, version } = action.payload;
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
                        (token) => listenerApi.dispatch(addOutputToken({ id, token })),
                        () => {
                            listenerApi.dispatch(completeExperiment(id));
                            resolve(undefined);
                        },
                        () => {
                            listenerApi.dispatch(failExperiment(id));
                            resolve(undefined);
                        },
                    )
                });
            } catch (e) {
                console.error(e);
                listenerApi.dispatch(failExperiment(id));
            }
        }

        await startWebSocket();
    },
});
