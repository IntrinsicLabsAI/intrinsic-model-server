import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isDevServer } from "./util";
import { HFFile } from "../models/HFFile";

export const huggingFaceServiceAPI = createApi({
    reducerPath: "huggingFaceServiceAPI",
    baseQuery: fetchBaseQuery({ baseUrl: isDevServer() ? "http://0.0.0.0:8000" : "/" }),
    endpoints: (builder) => ({
        getRepoFiles: builder.query<Array<HFFile>, string>({
            query: (modelRepo) => ({
                url: `ls/${modelRepo}`,
            }),
        }),
    }),
});

export const { useGetRepoFilesQuery } = huggingFaceServiceAPI;
