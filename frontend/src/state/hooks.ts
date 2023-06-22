import { TypedUseSelectorHook, useDispatch as useDispatchRaw, useSelector as useSelectorRaw } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch: () => AppDispatch = useDispatchRaw;
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorRaw;
