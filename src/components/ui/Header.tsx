import { useState } from 'react'
import { useMediaQuery } from "react-responsive";
import { Link } from 'react-router-dom';
import './Header.css'
import useBoardStore from '@/store/useBoardStore';
import logo from '@/assets/logo-mobile.svg'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import HeaderDropdown from '@/components/HeaderDropdown';
import DeleteModal from '@/components/modals/DeleteModal';
import AddEditTaskModal from '@/components/modals/AddEditTaskModal';
import AddEditBoardModal from '@/components/modals/AddEditBoardModal';
import { supabase } from "@/lib/supabaseClient"
import { useAppContext } from '@/context/AuthProvider'


export default function Header() {
    const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })
    const { session, randomUsername, setUsername, username } = useAppContext();
    const boards = useBoardStore((state) => state.boards);
    // Use the active board from the full list, not filtered, so guests can see the title
    const board = boards.find((board) => board.isActive); 
    const deleteBoard = useBoardStore((state) => state.deleteBoard)
    const setBoardActive = useBoardStore((state) => state.setBoardActive)
    const [openDropdown, setOpenDropdown] = useState(false);
    const [isElipsisMenuOpen, setIsElipsisMenuOpen] = useState(false);
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [boardType, setBoardType] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const onDropdownClick = () => {
        setOpenDropdown((state) => !state)
        setIsElipsisMenuOpen(false)
        setBoardType("ADD")
    }

    const handleConfirmDelete = async () => {
        await deleteBoard()
        setIsDeleteModalOpen(false)
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
    }

    const handleLogout = async () => {
        console.log('logout')
        const { error } = await supabase.auth.signOut();
        if (error) return console.error("error signOut", error);
        const username = randomUsername();
        setUsername(username);
        localStorage.setItem("username", username);
    }

    // if (!board) {
    //     return <div></div>
    // }

    return (
        <div className="header-container">
            <header>
                <div className="logo-container">
                    <img className="logo" src={logo} alt="logo" />
                    {isDesktop && <h3 className="logo-text">kanban</h3>}{" "}
                </div>

                <div className='header-name-container heading-L'>
                    <h3 className='header-name'>{board && board.name}</h3>
                    {!isDesktop && (openDropdown ? <ChevronUp onClick={() => { onDropdownClick() }} /> : <ChevronDown onClick={() => { onDropdownClick() }} />)}
                </div>

                {session ? <button className='mr-10!' onClick={handleLogout}>
                    {session.user.user_metadata.name}
                </button>
                    : <button className='mr-10!'>
                        <Link to='/login'>{username}</Link>
                    </button>
                }

                {/* Only show Add Task button if user is logged in AND there's a board with columns */}
                {session && board && board.columns.length > 0 ? <button className={`add-task-btn heading-M ${board.columns.length === 0 && "btn-off"}`}
                    onClick={() => {
                        setIsTaskModalOpen(true)
                        setIsElipsisMenuOpen(false)
                    }}
                    disabled={board.columns.length === 0}
                >
                    {isDesktop ? (
                        "+ Add New Task"
                    ) : (<Plus className="add-task" />)}
                </button> : ''}

                {openDropdown && !isDesktop && (
                    <HeaderDropdown
                        setOpenDropdown={setOpenDropdown}
                        setIsBoardModalOpen={setIsBoardModalOpen}
                        setBoardType={setBoardType}
                    />
                )}

            </header>

            {isDeleteModalOpen && board && (
                <DeleteModal
                    type="board"
                    title={board.name}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
            {isBoardModalOpen && (
                <AddEditBoardModal
                    type={boardType}
                    setIsBoardModalOpen={() => setIsBoardModalOpen(false)}
                />
            )}
            {isTaskModalOpen && (
                <AddEditTaskModal
                    setIsAddTaskModalOpen={setIsTaskModalOpen}
                    type="ADD"
                />
            )}
        </div>
    )
}