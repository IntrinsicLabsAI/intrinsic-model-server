import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetRegisteredModelsResponse } from '../api/index.ts';

export const baseServiceAPI = createApi({
    reducerPath: 'baseServiceAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/v1/' }),
    endpoints: (builder) => ({
        getModels: builder.query<GetRegisteredModelsResponse, string>({
          query: () => `models`,
        }),
      }),
});

export const { useGetModelsQuery } = baseServiceAPI;