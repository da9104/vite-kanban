import { useState } from "react"
import useBoardStore, { type Column } from '@/store/useBoardStore';
import { v4 as uuidv4 } from 'uuid'
import '@/components/Board.css'
import { X } from 'lucide-react'

interface AddEditBoardModalProps {
    type: string;
    setIsBoardModalOpen: (isOpen: boolean) => void;
}

export default function AddEditBoardModal({ type, setIsBoardModalOpen }: AddEditBoardModalProps) {
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [name, setName] = useState("")
    const [newColumns, setNewColumns] = useState<(Column & { id: string })[]>([
        { name: 'Todo', tasks: [], id: uuidv4() },
        { name: 'Doing', tasks: [], id: uuidv4() },
    ])
    const [isValid, setIsValid] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
    const board = useBoardStore((state) => state.boards).find((board) => board.isActive)
    const addBoard = useBoardStore((state) => state.addBoard)
    const editBoard = useBoardStore((state) => state.editBoard)

    if (type === "EDIT" && isFirstLoad) {
        if (board) {
            setNewColumns(
                board.columns.map((col) => {
                    return { ...col, id: col.id || uuidv4() }
                })
            )
            setName(board.name)
            setIsFirstLoad(false)
        }
    }

    const validate = () => {
        setIsValid(false)
        if (!name.trim()) {
            return false
        }
        for (let i = 0; i < newColumns.length; i++) {
            if (!newColumns[i].name.trim()) {
                return false
            }
        }
        setIsValid(true)
        return true
    }

    const onChange = (id: string, newValue: string) => {
        setNewColumns((prevState) => {
            const newState = [...prevState]
            const column = newState.find((col) => col.id === id)
            if (column) {
                column.name = newValue
            }
            return newState
        })
    }

    const onDelete = (id: string) => {
        setNewColumns((prevState) => prevState.filter((el) => el.id !== id))
    }

    const onSubmit = async (type: string) => {
        console.log("onSubmit function called."); // DEBUG LOG
        if (isSubmitting) return; // Prevent double submission
        
        setIsSubmitting(true);
        if (type === "ADD") {
            await addBoard(name, newColumns)
        } else {
            await editBoard(name, newColumns) // This will also need to be async
        }
        setIsSubmitting(false);
        setIsBoardModalOpen(false)
    }


    return (
        <div
            className="modal-container dimmed"
            onClick={(e) => {
                if (e.target !== e.currentTarget) {
                    return
                }
                setIsBoardModalOpen(false)
            }}
        >
            <div className="modal">
                <h3>{type === "EDIT" ? "Edit" : "Add New"} board</h3>
                <label htmlFor="board-name-input">Board Name</label>
                <div className="input-container">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        id="board-name-input"
                        type="text"
                        placeholder="e.g. Web Design"
                        className={!isValid && !name.trim() ? "red-border" : ""}
                        disabled={isSubmitting}
                    />
                    {!isValid && !name.trim() && (
                        <span className="cant-be-empty-span text-L"> Can't be empty</span>
                    )}
                </div>
                <label>Board Columns</label>
                <div className="modal-columns">
                    {newColumns.map((column, index) => {
                        return (
                            <div className="modal-column" key={index}>
                                <div className="input-container">
                                    <input
                                        onChange={(e) => {
                                            onChange(column.id, e.target.value)
                                        }}
                                        type="text"
                                        value={column.name}
                                        className={
                                            !isValid && !column.name.trim() ? "red-border" : ""
                                        }
                                        disabled={isSubmitting}
                                    />
                                    {!isValid && !column.name.trim() && (
                                        <span className="cant-be-empty-span text-L">
                                            {" "}
                                            Can't be empty
                                        </span>
                                    )}
                                </div>
                                <X onClick={() => { if (!isSubmitting) onDelete(column.id) }} />
                            </div>
                        )
                    })}
                </div>

                <button 
                    onClick={() => {
                        setNewColumns((state) => [
                            ...state,
                            { name: "", tasks: [], id: uuidv4() },
                        ])
                    }}
                    className="add-column-btn btn-light"
                    disabled={isSubmitting}
                >
                    + Add New Column
                </button>
                <button 
                    onClick={async () => {
                        console.log("Create button clicked. Running validation..."); // DEBUG LOG
                        const isValid = validate();
                        console.log("Validation returned:", isValid); // DEBUG LOG
                        if (isValid) {
                            await onSubmit(type)
                        }
                    }}
                    className="create-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (type === "ADD" ? "Creating..." : "Saving...") : (type === "ADD" ? "Create New Board" : "Save Changes")}
                </button>
                 <button onClick={() => setIsBoardModalOpen && setIsBoardModalOpen(false)} className="mt-2! btn cancel-btn">
                    Cancel
                </button>
            </div>
        </div>
    )
}