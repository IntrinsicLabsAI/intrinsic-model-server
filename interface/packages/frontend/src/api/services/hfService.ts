import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isDevServer } from "./util";
import { ListHFFilesResponse } from "../models/ListHFFilesResponse";

export const huggingFaceServiceAPI = createApi({
    reducerPath: "huggingFaceServiceAPI",
    baseQuery: fetchBaseQuery({ baseUrl: isDevServer() ? "http://0.0.0.0:8000/hf" : "/hf" }),
    endpoints: (builder) => ({
        getRepoFiles: builder.query<ListHFFilesResponse, string | undefined>({
            query: (modelRepo) => ({
                url: `ls/${modelRepo}`,
            }),
        }),
    }),
});

export const { useGetRepoFilesQuery } = huggingFaceServiceAPI;
