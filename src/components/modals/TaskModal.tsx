import { useState } from 'react'
import useBoardStore from '@/store/useBoardStore';
import '@/components/Task.modules.css'
import Subtask from '@/components/Subtask';
import DeleteModal from './DeleteModal'
import ElipsisMenu from '@/components/ui/ElipsisMenu'
import { EllipsisVertical } from 'lucide-react';
import AddEditTaskModal from './AddEditTaskModal'

interface TaskModalProps {
    taskIndex: number;
    colIndex: number;
    setIsTaskModalOpen: (isOpen: boolean) => void;
}

export default function TaskModal({ taskIndex, colIndex, setIsTaskModalOpen }: TaskModalProps) {
    const [isElipsisMenuOpen, setIsElipsisMenuOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
    const setTaskStatus = useBoardStore((state) => state.setTaskStatus)
    const deleteTask = useBoardStore((state) => state.deleteTask)
    const boards = useBoardStore((state) => state.boards);
    const board = boards.find((board) => board.isActive === true);

    const columns = board ? board.columns : []
    const col = columns.find((_, i) => i === colIndex)
    const task = col ? col.tasks.find((_, i) => i === taskIndex) : undefined

    const [status, setStatus] = useState(task ? task.status : '')
    const [newColIndex, setNewColIndex] = useState(col ? columns.indexOf(col) : 0)

    if (!board || !col || !task) return null;

    const subtasks = task.subtasks

    let completed = 0
    subtasks.forEach((subtask) => {
        if (subtask.isCompleted) {
            completed++
        }
    })

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value)
        setNewColIndex(e.target.selectedIndex)
    }

    const handleClose = () => {
        setTaskStatus({ status, colIndex, newColIndex, taskIndex })
        setIsTaskModalOpen(false)
    }

    const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }


    const handleConfirmDelete = async () => {
        setIsDeleteModalOpen(false)
        setIsTaskModalOpen(false)
        await deleteTask(colIndex, taskIndex)
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
    }

    const setOpenEditModal = () => {
        setIsAddTaskModalOpen(true)
        setIsElipsisMenuOpen(false)
    }
    const setOpenDeleteModal = () => {
        setIsElipsisMenuOpen(false)
        setIsDeleteModalOpen(true)
    }

    return (
        <div
            className={`modal-container ${!isDeleteModalOpen && "dimmed"}`}
            onClick={onOverlayClick}
        >
            <div className={`task-modal ${isDeleteModalOpen && "none"}`}>
                <div className='task-modal-title-container'>
                    <p className='heading-L'>{task.title}</p>
                    <div className='relative flex items-center'>
                        <EllipsisVertical
                            className="task-modal-elipsis"
                            onClick={() => setIsElipsisMenuOpen((prevState) => !prevState)}
                        />
                        {isElipsisMenuOpen && (
                            <ElipsisMenu
                                setOpenEditModal={setOpenEditModal}
                                setOpenDeleteModal={setOpenDeleteModal}
                                type="TASK"
                            />
                        )}
                    </div>
                </div>
                <p className='task-description text-L'>{task.description}</p>

                <p className="subtasks-completed heading-S">
                    Subtasks ({completed} of {subtasks.length})
                </p>
                {subtasks.map((_, index) => {
                    return (
                        <Subtask
                            index={index}
                            taskIndex={taskIndex}
                            colIndex={colIndex}
                            key={index}
                        />
                    )
                })}

                <div className='select-column-container'>
                    <label className='text-M'>Current Status</label>
                    <select
                        className='select-status text-L'
                        value={status}
                        onChange={onChange}
                    >
                        {columns.map((col, index) => (
                            <option className='status-options' key={index}>{col.name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleClose} className="mt-2! btn cancel-btn">
                    Cancel
                </button>
            </div>

            {isDeleteModalOpen && (
                <DeleteModal
                    type="TASK"
                    title={task.title}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
            {isAddTaskModalOpen && (
                <AddEditTaskModal
                    setIsAddTaskModalOpen={setIsAddTaskModalOpen}
                    setIsTaskModalOpen={setIsTaskModalOpen}
                    type="EDIT"
                    taskIndex={taskIndex}
                    prevColIndex={colIndex}
                />
            )}
        </div>
    )
}