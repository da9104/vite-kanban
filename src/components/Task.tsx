import { useState } from 'react'
import useBoardStore from '@/store/useBoardStore';
import React from 'react';
import TaskModal from '@/components/modals/TaskModal';


interface TaskProps {
    taskIndex: number;
    colIndex: number;
}

export default function Task({ taskIndex, colIndex }: TaskProps) {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const boards = useBoardStore((state) => state.boards);
    const board = boards.find((board) => board.isActive === true);

    if (!board) return null; // Handle case where no active board is found

    const columns = board.columns;
    const col = columns[colIndex];
    const task = col.tasks[taskIndex];

    let completed = 0
    let subtasks = task.subtasks

    subtasks.forEach((subtask) => {
        if (subtask.isCompleted) {
            completed++
        }
    });

    const handleOnDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text", JSON.stringify({taskIndex, prevColIndex: colIndex}))
    }

    return (
        <div>
            <div draggable
                onDragStart={handleOnDrag}
                className='task hover:bg-zinc-300/60! group'
                onClick={() => {
                    setIsTaskModalOpen(true)
                }}
            >
                <p className="task-title heading-M">{task.title}</p>
                <p className='num-of-subtasks text-M group-hover:text-blue-500!'>
                    {completed} of {subtasks.length} subtasks
                </p>
            </div>

            {isTaskModalOpen && (
                <TaskModal
                    colIndex={colIndex}
                    taskIndex={taskIndex}
                    setIsTaskModalOpen={setIsTaskModalOpen}
                />
            )}
        </div>
    )
}