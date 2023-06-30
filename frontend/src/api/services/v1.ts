import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetSavedExperimentsResponse, SavedExperimentIn, DiskImportSource, GetRegisteredModelsResponse, HFImportSource, Locator, TaskState } from '..';
import { isDevServer } from './util';

export const v1API = createApi({
  reducerPath: 'baseServiceAPI',
  tagTypes: [
    "models",
    "description",
    "experiments"
  ],
  baseQuery: fetchBaseQuery({ baseUrl: isDevServer() ? "http://0.0.0.0:8000/v1" : "/v1" }),
  endpoints: (builder) => ({
    getModels: builder.query<GetRegisteredModelsResponse, void>({
      query: () => `models`,
      providesTags: ["models"],
    }),
    deleteModel: builder.mutation<string, string>({
      invalidatesTags: ["models"],
      query: (modelGuid) => ({
        url: `${modelGuid}`,
        method: "DELETE",
      }),
    }),
    getDescription: builder.query<string, string>({
      providesTags: (_result, _error, query) => [{ type: "description", id: query }],
      query: (modelName) => ({
        url: `${modelName}/description`,
      }),
    }),
    updateDescription: builder.mutation<string | undefined, { modelName: string, description: string }>({
      invalidatesTags: (_result, _error, query) => [{ type: "description", id: query.modelName }],
      query: ({ modelName, description }) => ({
        url: `models/${modelName}/description`,
        method: "PUT",
        body: description,
        headers: {
          "Content-Type": "text/plain"
        },
      })
    }),
    updateModelName: builder.mutation<string | undefined, { modelName: string, name: string }>({
      invalidatesTags: ["models"],
      query: ({ modelName, name }) => ({
        url: `models/${modelName}/name`,
        method: "POST",
        body: name,
        headers: {
          "Content-Type": "text/plain"
        },
      })
    }),
    importModel: builder.mutation<string, Locator>({
      invalidatesTags: ["models"],
      query: (locator) => ({
        url: "imports",
        body: locator,
        method: "POST",
      })
    }),
    getImportStatus: builder.query<TaskState, string>({
      query: (importJobId) => ({
        url: `imports/${importJobId}`,
        method: "GET",
      }),
    }),
    getExperiments: builder.query<GetSavedExperimentsResponse, string>({
      query: (modelName) => ({
        url: `experiments-by-model/${modelName}`,
        providesTags: ["experiments"],
      }),
    }),
    addExperiment: builder.mutation<string, SavedExperimentIn>({
      invalidatesTags: ["experiments"],
      query: (experiment) => ({
        url: "experiments",
        body: experiment,
        method: "POST",
      })
    }),
    deleteExperiment: builder.mutation<string, string>({
      invalidatesTags: ["experiments"],
      query: (experiment_id) => ({
        url: `experiments/${experiment_id}`,
        method: "DELETE",
      })
    }),
  }),
});

export const {
  useGetModelsQuery,
  useGetDescriptionQuery,
  useGetImportStatusQuery,
  useDeleteModelMutation,
  useGetExperimentsQuery,
  useAddExperimentMutation,
  useDeleteExperimentMutation,
  useUpdateDescriptionMutation,
  useUpdateModelNameMutation,
  useImportModelMutation,
} = v1API;


// Custom type guards
export function isHuggingFaceSource(source: HFImportSource | DiskImportSource): source is HFImportSource {
  return source.type === "importv1/hf"
}

export function isDiskSource(source: HFImportSource | DiskImportSource): source is DiskImportSource {
  return source.type === "importv1/disk"
}