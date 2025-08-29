import { ZIndex } from "@/style/cssConst";
import { Modal, Box } from "@mui/material";
import { JSX } from "react";
export const ModalContainer = (
    props: {
        children: JSX.Element,
        closeFn: () => void,
        isOpen: boolean
    }) => {
    const boxStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '80%',
        maxWidth:"80%",
        overflow:"scroll",
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 3,
    }
    return (
        <Modal sx={{zIndex:ZIndex.modal}} open={props.isOpen} onClose={props.closeFn}>
            <Box sx={boxStyle}>
                {props.children}
            </Box>
        </Modal>
    );
}