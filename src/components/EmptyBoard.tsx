import { useState } from 'react'
import AddEditBoardModal from '@/components/modals/AddEditBoardModal'

interface EmptyBoardProps {
    type: string;
}

export default function EmptyBoard({ type }: EmptyBoardProps) {
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)


    const closeBoardModal = () => {
        setIsBoardModalOpen(false);
    };


    return (
        <div className='board-empty'>
            <h3 className='board-empty-text'>
                {type === "EDIT" ? "This board is empty. Create a new column to get started."
                    : "There are no boards available. Create a new board."
                }
            </h3>
            <button onClick={() => {
                setIsBoardModalOpen(true)
            }}
                className='add-column-btn'>
                {type === 'EDIT' ? "+ Add new Column" : "+ Add New Board"}
            </button>

               {isBoardModalOpen && <AddEditBoardModal type={type} setIsBoardModalOpen={closeBoardModal} />}
        </div>
    )
}