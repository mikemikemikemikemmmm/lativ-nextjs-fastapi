import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
interface Props {
    onDelete?: () => void
    onEdit?: () => void
    onDragStart?: () => void
    classProps?: string

}
export const IconBtnGroup = (props: Props) => {
    const { onDelete, onEdit, onDragStart} = props
    return <span className=" whitespace-nowrap" onDragStart={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
        {
            onDelete && <DeleteForeverIcon className='hover:text-teal-700 hover:cursor-pointer' onClick={onDelete} />
        }
        {
            onEdit && <EditIcon className='hover:text-teal-700 hover:cursor-pointer' onClick={onEdit} />
        }
        {
            onDragStart && <span className='hover:text-teal-700 hover:cursor-pointer' onDragStart={onDragStart} draggable>
                <LowPriorityIcon />
            </span>
        }
    </span>
} 