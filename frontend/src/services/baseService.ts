import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetRegisteredModelsResponse, ModelInfo } from '../api/index.ts';


const isDevServer = window.location.host.endsWith(":5173");

export const baseServiceAPI = createApi({
  reducerPath: 'baseServiceAPI',
  tagTypes: [
    "models",
    "description",
  ],
  baseQuery: fetchBaseQuery({ baseUrl: isDevServer ? "http://0.0.0.0:8000/v1" : '/v1' }),
  endpoints: (builder) => ({
    getModels: builder.query<GetRegisteredModelsResponse, void>({
      query: () => `models`,
      providesTags: ["models"]
    }),
    registerModel: builder.mutation<string, ModelInfo>({
      invalidatesTags: ["models"],
      query: (modelInfo) => ({
        url: "models",
        body: modelInfo,
        method: "POST",
      })
    }),
    deleteModel: builder.mutation<string, string>({
      invalidatesTags: ["models"],
      query: (modelGuid) => ({
        url: `${modelGuid}`,
        method: "DELETE",
      }),
    }),
    getDescription: builder.query<string, string>({
      providesTags: (_result, _error, query) => [{type: "description", id: query}],
      query: (modelName) => ({
        url: `${modelName}/description`,
      }),
    }),
    updateDescription: builder.mutation<string | undefined, { modelName: string, description: string }>({
      invalidatesTags: (_result, _error, query) => [{type: "description", id: query.modelName}],
      query: ({ modelName, description }) => ({
        url: `${modelName}/description`,
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
  useRegisterModelMutation,
  useDeleteModelMutation,
  useGetDescriptionQuery,
  useUpdateDescriptionMutation,
} = baseServiceAPI;
