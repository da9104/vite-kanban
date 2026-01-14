import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import HeaderDropdown from '@/components/HeaderDropdown'
import './SideBar.css'
import AddEditBoardModal from '@/components/modals/AddEditBoardModal'

interface SideBarProps {
    isSideBarOpen: boolean;
    setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SideBar({ isSideBarOpen, setIsSideBarOpen }: SideBarProps) {
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(true)
    const [boardType, setBoardType] = useState("");

    const toggleSideBar = () => {
        setIsSideBarOpen((curr) => !curr)
    }

    return (
        <div className={`sidebar ${!isSideBarOpen && "sidebar-closed"} ${isBoardModalOpen && 'sidebar-infront'}`}>
            {isSideBarOpen && <HeaderDropdown setBoardType={setBoardType} setOpenDropdown={setIsDropdownOpen} setIsBoardModalOpen={setIsBoardModalOpen} />}
            <div
                className={`toggle-sidebar-container ${!isSideBarOpen && "toggle-closed"}`}
                onClick={() => toggleSideBar()}>
                <p className='flex flex-row gap-2'>
                    {isSideBarOpen ? <Eye /> : <EyeOff />}
                    {isSideBarOpen && <p className='heading-M'>Hide Sidebar</p>}
                </p>
            </div>
            {isBoardModalOpen && (
                <AddEditBoardModal type={boardType} setIsBoardModalOpen={setIsBoardModalOpen} />
            )}
        </div>
    )
}