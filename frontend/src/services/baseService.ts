import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetRegisteredModelsResponse, ModelInfo } from '../api/index.ts';


const isDevServer = window.location.host.endsWith(":5174");

export const baseServiceAPI = createApi({
    reducerPath: 'baseServiceAPI',
    tagTypes: [
      "models",
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
            url: "/v1/models",
            body: modelInfo,
            method: "POST",
          })
        }),
        deleteModel: builder.mutation<string, string>({
          invalidatesTags: ["models"],
          query: (modelGuid) => ({
            url: `/v1/${modelGuid}`,
            method: "DELETE",
          }),
        }),
      }),
});

export const { useGetModelsQuery, useRegisterModelMutation, useDeleteModelMutation } = baseServiceAPI;
