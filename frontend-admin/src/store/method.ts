import { AlertItem, AppStore, deleteAlertListItemById, pustAlertListSingleItem, shiftAlertListItem, store } from "./store"

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
export const dispatchError = (error: string | Error | undefined | unknown) => {
    // const message = getErrorMessage(error)//TODO
    pushAlertItem({ severity: 'error', text: "1111" })
}