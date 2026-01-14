import { useState } from "react"
import useBoardStore from '@/store/useBoardStore';
import { useMediaQuery } from "react-responsive"
import Column from '@/components/Column'
import EmptyBoard from "@/components/EmptyBoard"
import SideBar from '@/components/ui/SideBar'
import './Board.css'
import AddEditBoardModal from '@/components/modals/AddEditBoardModal'
import Cursor from "@/components/ui/Cursor";

export default function Board() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })
    const boards = useBoardStore((state) => state.boards);
    const board = boards.find((board) => board.isActive === true);
    const columns = board ? board.columns : []; ``


    const closeBoardModal = () => {
        setIsBoardModalOpen(false);
    };

    return (
        <div className="relative">
            <Cursor />
            <div className={isDesktop && isSideBarOpen ? "board open-sidebar" : "board"}>
                {isDesktop && (<SideBar isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />)}
                {columns.length > 0 ? (
                    <>
                        {columns.map((_, index) => {
                            return ( <Column key={index} colIndex={index} />  )
                        })}
                        <div className="add-column-column heading-XL"
                            onClick={() => { setIsBoardModalOpen(true) }}>
                            + New Column
                        </div>
                    </>
                ) : (
                    <EmptyBoard type="EDIT" />
                )}
                {isBoardModalOpen && <AddEditBoardModal type="EDIT" setIsBoardModalOpen={closeBoardModal} />}
            </div>
        </div>
    )
}