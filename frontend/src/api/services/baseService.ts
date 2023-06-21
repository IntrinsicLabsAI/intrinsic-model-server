import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetRegisteredModelsResponse, ListHFFilesResponse, ModelInfo, HFLocator } from '..';
import { isDevServer } from './util';

export const baseServiceAPI = createApi({
  reducerPath: 'baseServiceAPI',
  tagTypes: [
    "models",
    "description",
  ],
  baseQuery: fetchBaseQuery({ baseUrl: isDevServer() ? "http://0.0.0.0:8000" : '/' }),
  endpoints: (builder) => ({
    getModels: builder.query<GetRegisteredModelsResponse, void>({
      query: () => `v1/models`,
      providesTags: ["models"]
    }),
    registerModel: builder.mutation<string, ModelInfo>({
      invalidatesTags: ["models"],
      query: (modelInfo) => ({
        url: "v1/models",
        body: modelInfo,
        method: "POST",
      })
    }),
    deleteModel: builder.mutation<string, string>({
      invalidatesTags: ["models"],
      query: (modelGuid) => ({
        url: `v1/${modelGuid}`,
        method: "DELETE",
      }),
    }),
    getDescription: builder.query<string, string>({
      providesTags: (_result, _error, query) => [{ type: "description", id: query }],
      query: (modelName) => ({
        url: `v1/${modelName}/description`,
      }),
    }),
    getHFFiles: builder.query<ListHFFilesResponse, string>({
      providesTags: (_result, _error, query) => [{ type: "description", id: query }],
      query: (modelRepo) => ({
        url: `/hfbrowse/ls/${modelRepo}`,
      }),
    }),
    inportModel: builder.mutation<string, HFLocator>({
      invalidatesTags: ["models"],
      query: (HFLocator) => ({
        url: "v1/import",
        body: HFLocator,
        method: "POST",
      })
    }),
    updateDescription: builder.mutation<string | undefined, { modelName: string, description: string }>({
      invalidatesTags: (_result, _error, query) => [{ type: "description", id: query.modelName }],
      query: ({ modelName, description }) => ({
        url: `v1/${modelName}/description`,
        method: "PUT",
        body: description,
        headers: {
          "Content-Type": "text/plain"
        },
      })
    }),
  }),
});

export const {
  useGetModelsQuery,
  useGetDescriptionQuery,
  useGetHFFilesQuery,
  useRegisterModelMutation,
  useDeleteModelMutation,
  useUpdateDescriptionMutation,
  useInportModelMutation,
} = baseServiceAPI;
