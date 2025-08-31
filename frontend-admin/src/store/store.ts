import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
type AlertSeverity = 'error' | 'warning' | 'info' | 'success'
export interface AlertItem { severity: AlertSeverity, text: string, id?: number }
interface State {
  // isLoading: boolean
  alertList: AlertItem[],
  loadingList: number[]
}

const initialState: State = {
  // isLoading: false,
  alertList: [],
  loadingList: []
}
export const appSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {
    // setIsLoading: (state, action: PayloadAction<boolean>) => {
    //   if (state.isLoading === action.payload) {
    //     return
    //   }
    //   state.isLoading = action.payload
    // },
    pushIdToLoadingList: (state, action: PayloadAction<number>) => {
      state.loadingList = [...state.loadingList, action.payload]
    },
    deleteIdToLoadingList: (state, action: PayloadAction<number>) => {
      state.loadingList = [...state.loadingList, action.payload]
    },
    pustAlertListSingleItem: (state, action: PayloadAction<AlertItem>) => {
      state.alertList = [...state.alertList, action.payload]
    },
    shiftAlertListItem: (state) => {
      if (state.alertList.length > 0) {
        const copy = [...state.alertList]
        copy.shift()
        state.alertList = copy
      }
    },
    deleteAlertListItemById: (state, action: PayloadAction<number>) => {
      const targetIndex = state.alertList.findIndex(a => a.id === action.payload)
      if (targetIndex !== -1) {
        const newList = [...state.alertList]
        newList.splice(targetIndex)
        state.alertList = newList
      }
    }
  },
})
export const {
  pustAlertListSingleItem,
  // setIsLoading,
  shiftAlertListItem,
  deleteAlertListItemById } = appSlice.actions

const makeStore = () => configureStore({
  reducer: {
    appSlice: appSlice.reducer,
  },
})
export const store = makeStore()
// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']