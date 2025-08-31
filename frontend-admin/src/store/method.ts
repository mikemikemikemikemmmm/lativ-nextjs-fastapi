import { AlertItem,  deleteAlertListItemById, pustAlertListSingleItem, shiftAlertListItem, store } from "./store"

export const pushAlertItem = (alertItem: AlertItem) => {
  const state = store.getState()
  const { alertList } = state.appSlice
  if (alertList.length >= 6) {
    store.dispatch(shiftAlertListItem())
  }
  const alertData = { ...alertItem, id: Math.random() }
  store.dispatch(pustAlertListSingleItem(alertData))
  setTimeout(() => {
    store.dispatch(deleteAlertListItemById(alertData.id))
  }, 3000)
}
export const dispatchError = (error: string ) => {
    pushAlertItem({ severity: 'error', text: error })
}
export const dispatchSuccess = (message: string ) => {
    pushAlertItem({ severity: "success", text: message })
}