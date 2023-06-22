import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RegisteredModel } from "../api";
export interface AppState {
    // All models from the server that the user has access to
    models: Array<RegisteredModel>;

    // Actively being viewed model
    activeModel: [string, string] | undefined;
}

const initialState: AppState = {
    models: [],
    activeModel: undefined,
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        loadModels: (state, action: PayloadAction<Array<RegisteredModel>>) => {
            state.models.push(...action.payload);
        },
        setActiveModel: (state, action: PayloadAction<[string, string] | undefined>) => {
            state.activeModel = action.payload;
        },
    },
});

export const { loadModels, setActiveModel } = appSlice.actions;