import { useState } from "react"
import useBoardStore from '@/store/useBoardStore';
import { useMediaQuery } from "react-responsive"
import Column from '@/components/Column'
import EmptyBoard from "@/components/EmptyBoard"
import SideBar from '@/components/ui/SideBar'
import './Board.css'
import AddEditBoardModal from '@/components/modals/AddEditBoardModal'
import Cursor from "@/components/ui/Cursor";
import { useAppContext } from "@/context/AuthProvider";

export default function Board() {
    const { session } = useAppContext();
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
                        {session && (
                            <div className="add-column-column heading-XL"
                                onClick={() => { setIsBoardModalOpen(true) }}>
                                + New Column
                            </div>
                        )}
                    </>
                ) : (
                    session ? <EmptyBoard type="EDIT" /> : <div className="board-empty"><h3 className="board-empty-text">This board is empty.</h3></div>
                )}
                {isBoardModalOpen && <AddEditBoardModal type="EDIT" setIsBoardModalOpen={closeBoardModal} />}
            </div>
        </div>
    )
}