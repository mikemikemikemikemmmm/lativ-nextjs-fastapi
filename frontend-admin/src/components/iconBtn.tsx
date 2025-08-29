import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
export const DeleteBtn = (props: { onClick: () => void }) => {
    return <DeleteForeverIcon onClick={props.onClick} />
}
export const EditBtn = (props: { onClick: () => void }) => {
    return <EditIcon onClick={props.onClick} />
}
export const SwitchOrderBtn = (props: { onClick: () => void }) => {
    return <LowPriorityIcon onClick={props.onClick} />
}