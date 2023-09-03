import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    GetSavedExperimentsResponse,
    SavedExperimentIn,
    DiskImportSource,
    GetRegisteredModelsResponse,
    HFImportSource,
    Locator,
    TaskState,
    CreateTaskRequest,
    TaskInfo,
} from "..";
import { isDevServer } from "./util";

export const v1API = createApi({
    reducerPath: "baseServiceAPI",
    tagTypes: ["models", "description", "experiments", "tasks"],
    baseQuery: fetchBaseQuery({ baseUrl: isDevServer() ? "http://0.0.0.0:8000/v1" : "/v1" }),
    endpoints: (builder) => ({
        getModels: builder.query<GetRegisteredModelsResponse, void>({
            query: () => `models`,
            providesTags: ["models"],
        }),
        deleteModel: builder.mutation<string, string>({
            invalidatesTags: ["models"],
            query: (modelName) => ({
                url: `models/${modelName}`,
                method: "DELETE",
            }),
        }),
        deleteModelVersion: builder.mutation<string, { model: string; version: string }>({
            invalidatesTags: ["models"],
            query: (model) => ({
                url: `models/${model.model}/versions/${model.version}`,
                method: "DELETE",
            }),
        }),
        getDescription: builder.query<string, string>({
            providesTags: (_result, _error, query) => [{ type: "description", id: query }],
            query: (modelName) => ({
                url: `models/${modelName}/description`,
            }),
        }),
        updateDescription: builder.mutation<
            string | undefined,
            { modelName: string; description: string }
        >({
            invalidatesTags: (_result, _error, query) => [
                { type: "description", id: query.modelName },
            ],
            query: ({ modelName, description }) => ({
                url: `models/${modelName}/description`,
                method: "PUT",
                body: description,
                headers: {
                    "Content-Type": "text/plain",
                },
            }),
        }),
        updateModelName: builder.mutation<string | undefined, { modelName: string; name: string }>({
            invalidatesTags: ["models"],
            query: ({ modelName, name }) => ({
                url: `models/${modelName}/name`,
                method: "POST",
                body: name,
                headers: {
                    "Content-Type": "text/plain",
                },
            }),
        }),
        importModel: builder.mutation<string, Locator>({
            invalidatesTags: ["models"],
            query: (locator) => ({
                url: "imports",
                body: locator,
                method: "POST",
            }),
        }),
        getImportStatus: builder.query<TaskState, string>({
            query: (importJobId) => ({
                url: `imports/${importJobId}`,
                method: "GET",
            }),
        }),
        getSavedExperiments: builder.query<GetSavedExperimentsResponse, string>({
            providesTags: (_result, _error, modelName) => [{ type: "experiments", id: modelName }],
            query: (modelName) => ({
                url: `experiments-by-model/${modelName}`,
                providesTags: ["experiments"],
            }),
        }),
        saveExperiment: builder.mutation<string, SavedExperimentIn>({
            invalidatesTags: ["experiments"],
            query: (experiment) => ({
                url: "experiments",
                body: experiment,
                method: "POST",
            }),
        }),
        deleteExperiment: builder.mutation<string, string>({
            invalidatesTags: ["experiments"],
            query: (experiment_id) => ({
                url: `experiments/${experiment_id}`,
                method: "DELETE",
            }),
        }),
        createTask: builder.mutation<string, CreateTaskRequest>({
            invalidatesTags: ["tasks"],
            query: (createRequest) => ({
                url: "tasks",
                body: createRequest,
                method: "POST",
            }),
        }),
        renameTask: builder.mutation<string, { oldName: string; newName: string }>({
            invalidatesTags: ["tasks"],
            query: (body) => ({
                url: `tasks/${body.oldName}/name`,
                body: body.newName,
                method: "POST",
            }),
        }),
        getTasks: builder.query<TaskInfo[], void>({
            query: () => `tasks`,
            providesTags: ["tasks"],
        }),
    }),
});

export const {
    useGetModelsQuery,
    useGetDescriptionQuery,
    useGetImportStatusQuery,
    useDeleteModelMutation,
    useDeleteModelVersionMutation,
    useGetSavedExperimentsQuery,
    useSaveExperimentMutation,
    useDeleteExperimentMutation,
    useUpdateDescriptionMutation,
    useUpdateModelNameMutation,
    useImportModelMutation,
    useGetTasksQuery,
    useCreateTaskMutation
} = v1API;

// Custom type guards
export function isHuggingFaceSource(
    source: HFImportSource | DiskImportSource
): source is HFImportSource {
    return source.type === "importv1/hf";
}

export function isDiskSource(
    source: HFImportSource | DiskImportSource
): source is DiskImportSource {
    return source.type === "importv1/disk";
}
