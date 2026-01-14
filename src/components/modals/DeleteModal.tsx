import '@/components/Task.modules.css'

interface DeleteModalProps {
    type: string;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteModal({ type, title, onConfirm, onCancel }: DeleteModalProps) {

    return (
            <div className="modal-container dimmed">
                <div className="delete-modal">
                    <h3 className="heading-L"> Delete this {type}?</h3>
                    {type === "TASK" ? (
                        <p className="text-L">
                            Are you sure you want to delete the "{title}" task and its subtasks?
                            This action cannot be reversed.
                        </p>
                    ) : (
                        <p className="text-L">
                            Are you sure you want to delete the "{title}" board? This action
                            will remove all columns and tasks and cannot be reversed.
                        </p>
                    )}

                    <div className="delete-modal-btns">
                        <button onClick={onConfirm} className="btn delete-btn">
                            Delete
                        </button>
                        <button onClick={onCancel} className="btn cancel-btn">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
    )
}