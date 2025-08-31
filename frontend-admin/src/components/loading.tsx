import { RootState } from "@/store/store";
import { ZIndex } from "@/style/cssConst";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";
export const LoadingContainer = () => {
    const loadingCount = useSelector((state: RootState) => state.appSlice.loadingCount)
    return <Backdrop
        sx={{ bgcolor: 'transparent', color: 'black', zIndex: ZIndex.loading }}
        open={loadingCount > 0}
    >
        <CircularProgress color="inherit" />
    </Backdrop>
}