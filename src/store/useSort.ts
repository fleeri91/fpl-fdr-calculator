import { create } from 'zustand'

type SortState = {}

type SortActions = {}

const initialState: SortState = {}

export const useSortStore = create<SortState & SortActions>()((set) => ({
  ...initialState,
}))
