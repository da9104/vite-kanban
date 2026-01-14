import useBoardStore from '@/store/useBoardStore';

interface SubtaskProps {
    index: number;
    taskIndex: number;
    colIndex: number;
}

export default function Subtask({ index, taskIndex, colIndex }: SubtaskProps) {
    const boards = useBoardStore((state) => state.boards);
    const setSubTaskCompleted = useBoardStore((state) => state.setSubTaskCompleted)
    const board = boards.find((board) => board.isActive === true);

    if (!board) return null; // Handle case where no active board is found

    const col = board.columns[colIndex];
    if (!col) return null;

    const task = col.tasks[taskIndex];
    if (!task) return null;

    const subtask = task.subtasks[index];
    if (!subtask) return null;

    const onChange = () => {
        setSubTaskCompleted(colIndex, taskIndex, index)
    }

    return (
        <div className="subtask">
            <input className="subtask-checkbox"
                type="checkbox"
                checked={subtask.isCompleted ?? false}
                onChange={onChange}
            />
            <p className={`subtask-text text-M ${subtask.isCompleted && "checked"}`}>
                {subtask.title}
            </p>
        </div>
    )
}