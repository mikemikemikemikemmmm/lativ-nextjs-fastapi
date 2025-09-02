import { ZIndex } from "@/style/cssConst";
import { Modal, Box } from "@mui/material";
import { JSX } from "react";
export const ModalContainer = (
    props: {
        children: JSX.Element,
        closeFn: () => void,
        isOpen: boolean,
        style?:object
    }) => {
    const boxStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '90%',
        maxWidth: "90%",
        bgcolor: 'background.paper',
        boxShadow: 24,
        overflowY:"scroll",
        ...props.style
    }
    return (
        <Modal id="modal-container" sx={{ zIndex: ZIndex.modal }} open={props.isOpen} onClose={props.closeFn}>
            <Box sx={boxStyle}>
                <div className="px-7 pb-4">
                    {props.children}
                </div>
            </Box>
        </Modal>
    );
}