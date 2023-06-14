import { configureStore } from '@reduxjs/toolkit';
import { baseServiceAPI } from './api/services/baseService';

export const store = configureStore({
  reducer: {
    [baseServiceAPI.reducerPath]: baseServiceAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseServiceAPI.middleware),
});
