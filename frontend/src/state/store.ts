import { configureStore } from '@reduxjs/toolkit';
import { v1API } from '../api/services/v1';
import { huggingFaceServiceAPI } from '../api/services/hfService';
import { appSlice } from "./appSlice";

export const store = configureStore({
  reducer: {
    [v1API.reducerPath]: v1API.reducer,
    [huggingFaceServiceAPI.reducerPath]: huggingFaceServiceAPI.reducer,
    app: appSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(v1API.middleware, huggingFaceServiceAPI.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;