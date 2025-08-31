
import { useAppSelector } from "@/store/hook";
import { ZIndex } from "@/style/cssConst";
import Alert from "@mui/material/Alert";
export const AlertContainer = () => {
    const alertList = useAppSelector((state) => state.appSlice.alertList)
    return <div
        style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex:  ZIndex.alert
        }}
    >
        {
            alertList.map((alert) => {
                return (
                    <Alert
                        key={alert.id}
                        sx={{ margin: 1, fontSize: 20 }}
                        severity={alert.severity}
                    >
                        {alert.text}
                    </Alert>
                )
            })
        }
    </div>
}