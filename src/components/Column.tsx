import useBoardStore from '@/store/useBoardStore';
import './Column.css'
import React from 'react';
import Task from '@/components/Task';

interface ColumnProps {
    colIndex: number;
}

export default function Column({ colIndex }: ColumnProps) {
    const boards = useBoardStore((state) => state.boards);
    const dragTask = useBoardStore((state) => state.dragTask)
    const board = boards.find((board) => board.isActive === true);

    if (!board) return null;

    const col = board.columns[colIndex]; // Access column directly by index

    const handleOnDrop = (e: React.DragEvent<HTMLDivElement>) => {
        const { prevColIndex, taskIndex } = JSON.parse(e.dataTransfer.getData("text"))
        if (colIndex !== prevColIndex) {
            dragTask(colIndex, prevColIndex, taskIndex)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    return (
        <div className='column' onDrop={handleOnDrop} onDragOver={handleDragOver}>
            <p className='col-name heading-S'>
                {col.name} ({col.tasks.length})
            </p>
            {col.tasks.map((_, index) => {
                return (
                    <Task key={index} taskIndex={index} colIndex={colIndex} />
                )
            })}
        </div>
    )
}