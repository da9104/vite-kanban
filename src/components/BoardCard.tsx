import useBoardStore from '@/store/useBoardStore';
import { usePresenceStore } from '@/store/usePresenceStore';
import { useEffect } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';
import { useAppContext } from '@/context/AuthProvider';

export default function BoardCard() {
    const boards = useBoardStore((state) => state.boards);
    const fetchBoards = useBoardStore((state) => state.fetchBoards);
    const setActiveBoardById = useBoardStore((state) => state.setActiveBoardById);
    const others = usePresenceStore((state) => state.others);
    const me = usePresenceStore((state) => state.me);
    const navigate = useNavigate();
    const { session, username } = useAppContext()

    useEffect(() => {
        // Fetch all boards if not already fetched
        if (boards.length === 0) {
            fetchBoards();
        }
    }, [boards.length, fetchBoards]);

    const getOwnerName = (userId?: string) => {
        if (!userId) return "Unknown";
        if (me?.id === userId) return "You";
        const foundUser = others.find(u => u.id === userId);
        // Fallback to truncated userId if name is not found through presence
        return foundUser?.name || `User ${userId.slice(0, 8)}...`; 
    };

    const handleClick = (boardId: string) => {
        const path = generatePath('/:boardId', { boardId });
        setActiveBoardById(boardId);
        navigate(path);
    };


    return (
        <div className="flex flex-col gap-4">
            <h2 className="heading-L text-black dark:text-white mb-4 mt-4 px-4">Browse All Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {boards.map((board) => (
                    <div
                        key={board.id}
                        className="p-4! bg-white dark:bg-[#2b2c37] rounded-lg shadow-md border border-transparent hover:border-[#635fc7] cursor-pointer transition-all no-underline"
                        onClick={() => {
                            if (board.id) {
                                handleClick(board.id);
                            }
                        }}
                    >
                        <h3 className="text-lg font-bold text-black dark:text-white">{board.name}</h3>
                        <p className="body-M text-[#828fa3] mt-2">{board.columns?.length || 0} Columns </p>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-[#828fa3]">
                                Owner: {getOwnerName(board.user_id)}
                            </span>
                        </div>
                    </div>
                ))}
                {boards.length === 0 && (
                    <p className="text-[#828fa3]">No boards found in the database.</p>
                )}
            </div>
        </div>
    );
}
