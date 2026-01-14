import { useState } from "react"
import useBoardStore, { type Task, type Column } from '@/store/useBoardStore';
import { v4 as uuidv4 } from 'uuid'
import { X } from 'lucide-react'

interface AddEditTaskModalProps {
    type: string;
    setIsAddTaskModalOpen: (isOpen: boolean) => void;
    setIsTaskModalOpen?: (isOpen: boolean) => void;
    taskIndex?: number;
    prevColIndex?: number;
}

export default function AddEditTaskModal({ type, setIsTaskModalOpen, setIsAddTaskModalOpen, taskIndex, prevColIndex = 0 }: AddEditTaskModalProps) {
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [isValid, setIsValid] = useState(true)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const addTask = useBoardStore((state) => state.addTask)
    const editTask = useBoardStore((state) => state.editTask)
    const board = useBoardStore((state) => state.boards).find((board) => board.isActive)
    
    if (!board) {
        return null; // Handle case where no active board is found
    }

    const columns = board.columns
    const col = columns.find((col, index) => index === prevColIndex)
    const task = col ? col.tasks.find((task, index) => index === taskIndex) : undefined
    const [newColIndex, setNewColIndex] = useState(prevColIndex)
    const [status, setStatus] = useState(
        type === 'EDIT' && task ? task.status : (columns.length > 0 ? columns[0].name : '')
    )
    const [subtasks, setSubtasks] = useState([
        { title: '', isCompleted: false, id: uuidv4() },
        { title: '', isCompleted: false, id: uuidv4() }
    ])

    if (type === "EDIT" && isFirstLoad) {
        if (task) {
            setSubtasks(
                task.subtasks.map((subtask) => {
                    return { ...subtask, id: uuidv4() }
                })
            )
            setTitle(task.title)
            setDescription(task.description)
            setStatus(task.status)
            setIsFirstLoad(false)
        }
    }

    const validate = () => {
        setIsValid(false)
        if (!title.trim()) {
            return false
        }
        for (let i = 0; i < subtasks.length; i++) {
            if (!subtasks[i].title.trim()) {
                return false
            }
        }
        setIsValid(true)
        return true
    }

    const onChangeSubtasks = (id, newValue) => {
        setSubtasks((prevState) => {
            const newState = [...prevState]
            const subtask = newState.find((subtask) => subtask.id === id)
            if (subtask) {
                subtask.title = newValue
            }
            return newState
        })
    }

    const onDelete = (id: string) => {
        setSubtasks((prevState) => prevState.filter((el) => el.id !== id))
    }

    const onChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value)
        setNewColIndex(e.target.selectedIndex)
    }


    const onSubmit = (type : string) => {
        if (type === "ADD") {
            addTask({
                title,
                description,
                subtasks,
                status,
                newColIndex
            })
        } else {
            editTask({
                title,
                description,
                subtasks,
                status,
                taskIndex,
                prevColIndex,
                newColIndex
            })
        }
    }




    return (
        <div className={`modal-container ${type === 'ADD' ? 'dimmed' : ''}`}
            onClick={(e) => {
                if (e.target !== e.currentTarget) {
                    return;
                }
                setIsAddTaskModalOpen(false)
            }}
        >
            <div className="modal">
                <h3>{type === 'EDIT' ? 'Edit' : "Add New"} Task</h3>
                <label htmlFor="task-name-input">Task Name</label>

                <div className="input-container">
                    <input value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        id="taks-name-input"
                        type="text"
                        placeholder="e.g. Take Coffee Break"
                        className={!isValid && !title.trim() ? "red-board" : ""

                        } />
                    {!isValid && !title.trim() && (
                        <span className="cant-be-empty-span text-L"> Can't be empty</span>
                    )}
                </div>

                <label htmlFor="task-name-input">Description</label>
                <div className="description-container">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        id="task-description-input"
                        placeholder="e.g. It's always good to take a break."
                    />
                </div>

                <label>Subtask</label>
                <div className="modal-columns">
                    {subtasks.map((subtask, index) => {
                        return (
                            <div className="modal-column" key={index}>
                                <div className="input-container">
                                    <input onChange={(e) => {
                                        onChangeSubtasks(subtask.id, e.target.value)
                                    }}
                                        type="text"
                                        value={subtask.title}
                                        className={!isValid && !subtask.title.trim() ? "red-border" : ""}
                                    />
                                    {!isValid && !subtask.title.trim() ? (
                                        <span className="cant-be-empty-span text-L">
                                            {" "}
                                            can't be empty
                                        </span>

                                    ) : null}
                                </div>
                                <X onClick={() => { onDelete(subtask.id) }} />
                            </div>
                        )
                    })}
                </div>

                <button onClick={() => {
                    setSubtasks((state) => [
                        ...state,
                        { title: "", isCompleted: false, id: uuidv4() },
                    ])
                }}
                    className="add-column-btn btn-light"
                >

                    +Add New Subtask
                </button>

                <div className="select-column-container">
                    <label className="text-M">Curret Status</label>
                    <select
                        className="select-status text-L"
                        value={status}
                        onChange={onChangeStatus}
                    >
                        {columns.map((col, index) => {
                            return (
                                <option className="status-options" key={index}>
                                    {col.name}
                                </option>
                            )
                        })}

                    </select>
                </div>

                <button onClick={() => {
                    const isValid = validate()
                    if (isValid) {
                        onSubmit(type)
                        setIsAddTaskModalOpen(false)
                        type === 'edit' && setIsTaskModalOpen && setIsTaskModalOpen(false)
                    }
                }}
                    className="create-btn"
                >

                    Create Task
                </button>
                 <button onClick={() => setIsAddTaskModalOpen && setIsAddTaskModalOpen(false)} className="mt-2! btn cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    )
}