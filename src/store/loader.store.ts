import { create } from "zustand"

interface LoaderState {
  activeRequests: number
  isLoading: boolean
  increment: () => void
  decrement: () => void
}

export const useLoaderStore = create<LoaderState>((set) => ({
  activeRequests: 0,
  isLoading: false,
  increment: () =>
    set((state) => {
      const count = state.activeRequests + 1
      return { activeRequests: count, isLoading: count > 0 }
    }),
  decrement: () =>
    set((state) => {
      const count = Math.max(0, state.activeRequests - 1)
      return { activeRequests: count, isLoading: count > 0 }
    })
}))
