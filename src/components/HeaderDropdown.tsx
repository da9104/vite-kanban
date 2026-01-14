import useThemeStore from '@/store/useThemeStore'
import useBoardStore from '@/store/useBoardStore';
import { Moon, Sun } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import boardIcon from '@/assets/icon-board.svg'
import React, { useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import ElipsisMenu from '@/components/ui/ElipsisMenu';
import DeleteModal from '@/components/modals/DeleteModal';

interface HeaderDropdownProps {
    setOpenDropdown?: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBoardModalOpen: (isOpen: boolean) => void;
    setBoardType: React.Dispatch<React.SetStateAction<string>>;
}

export default function HeaderDropdown({ setOpenDropdown, setIsBoardModalOpen, setBoardType }: HeaderDropdownProps) {
    const { theme, toggleTheme } = useThemeStore()
    const boards = useBoardStore((state) => state.boards);
    const setBoardActive = useBoardStore((state) => state.setBoardActive)
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const deleteBoard = useBoardStore((state) => state.deleteBoard)
    const navigate = useNavigate();

    const activeBoard = boards.find(b => b.isActive);

    const setOpenEditModal = () => {
        setBoardType("EDIT")
        setIsBoardModalOpen(true)
        setOpenMenuIndex(null)
    }

    const setOpenDeleteModal = () => {
        setIsDeleteModalOpen(true)
    }


    const handleConfirmDelete = async () => {
        await deleteBoard()
        setIsDeleteModalOpen(false)
        setOpenDropdown?.(false)
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
    }

    return (
        <div className='dropdown-container'
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                if (e.target !== e.currentTarget) {
                    return;
                }
                setOpenDropdown?.(false)
            }}
        >
            <div className='dropdown-modal'>
                <h3> ALL BOARDS ({boards.length}) </h3>
                <div className='dropdown-boards'>
                    {boards.map((board, index) => {
                        return (
                            <div className={`dropdown-board ${board.isActive ? "board-active" : ""}`}
                                key={index}
                                onClick={() => {
                                    if (board.id) {
                                        navigate(`/${board.id}`)
                                        setOpenDropdown?.(false)
                                    }
                                }}
                            >
                                <div className='flex flex-row items-center justify-between'>
                                    <p className='flex flex-row items-center'>
                                        <img className='filter-white w-4 h-4' src={boardIcon} alt="board" />
                                        {board.name}
                                    </p>

                                    <div className='relative flex items-center'>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuIndex(openMenuIndex === index ? null : index)
                                            }}
                                            className='!z-[999]'
                                        >
                                            <EllipsisVertical size={18} />
                                        </button>
                                        {openMenuIndex === index && (
                                            <ElipsisMenu
                                                setOpenEditModal={() => {
                                                    setBoardActive(index)
                                                    setOpenEditModal()
                                                }}
                                                setOpenDeleteModal={() => { 
                                                    setBoardActive(index)
                                                    setOpenDeleteModal() 
                                                }}
                                                type="board"
                                            />
                                        )}
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                    <div className='dropdown-board dropdown-create-board-btn'
                        onClick={() => {
                            setBoardType("ADD")
                            setIsBoardModalOpen(true)
                            setOpenDropdown?.(prev => !prev)
                        }}
                    >
                        + Create New Board
                    </div>
                </div>

                <div className='theme-toggle'>
                    <Sun />
                    <label className='switch'>
                        <input type="checkbox"
                            checked={theme === "dark"}
                            onChange={() => toggleTheme()} />
                        <span className='slider round'></span>
                    </label>
                    <Moon />
                </div>
            </div>
            {isDeleteModalOpen && activeBoard && (
                <DeleteModal
                    type="board"
                    title={activeBoard.name}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    )
}