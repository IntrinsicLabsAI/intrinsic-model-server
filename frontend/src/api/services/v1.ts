import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DiskImportSource, GetRegisteredModelsResponse, HFImportSource, Locator, TaskState } from '..';
import { isDevServer } from './util';

export const v1API = createApi({
  reducerPath: 'baseServiceAPI',
  tagTypes: [
    "models",
    "description",
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
        url: `${modelName}/description`,
        method: "PUT",
        body: description,
        headers: {
          "Content-Type": "text/plain"
        },
      })
    }),
    importModel: builder.mutation<string, Locator>({
      invalidatesTags: ["models"],
      query: (locator) => ({
        url: "import",
        body: locator,
        method: "POST",
      })
    }),
    getImportStatus: builder.query<TaskState, string>({
      query: (importJobId) => ({
        url: `import/${importJobId}`,
        method: "GET",
      }),
    })
  }),
});

export const {
  useGetModelsQuery,
  useGetDescriptionQuery,
  useGetImportStatusQuery,
  useDeleteModelMutation,
  useUpdateDescriptionMutation,
  useImportModelMutation,
} = v1API;


// Custom type guards
export function isHuggingFaceSource(source: HFImportSource | DiskImportSource): source is HFImportSource {
  return source.type === "importv1/hf"
}

export function isDiskSource(source: HFImportSource | DiskImportSource): source is DiskImportSource {
  return source.type === "importv1/disk"
}