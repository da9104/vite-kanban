import useBoardStore from '@/store/useBoardStore';
import { usePresenceStore } from '@/store/usePresenceStore';
import { useEffect } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';
import { motion } from "framer-motion"
import { MousePointer2 } from 'lucide-react'

export default function LandingPage() {
    const boards = useBoardStore((state) => state.boards);
    const fetchBoards = useBoardStore((state) => state.fetchBoards);
    const setActiveBoardById = useBoardStore((state) => state.setActiveBoardById);
    const others = usePresenceStore((state) => state.others);
    const me = usePresenceStore((state) => state.me);
    const navigate = useNavigate();

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
        const path = generatePath('/share/:boardId', { boardId });
        setActiveBoardById(boardId);
        navigate(path);
    };


    return (
        <div className="flex items-center justify-center flex-col gap-4 leading-9">
            <div className="text-center mb-12">
                <div className="flex justify-center relative w-48 h-32 mx-auto mb-8">
                    {/* Green cursor - moves in a different path */}
                    <motion.div
                        className="absolute text-green-500"
                        animate={{
                            x: [80, 100, 70, 90, 80],
                            y: [40, 60, 80, 50, 40],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    >
                        <MousePointer2 size={20} />
                    </motion.div>

                    {/* Orange cursor - moves in its own path */}
                    <motion.div
                        className="absolute text-orange-500"
                        animate={{
                            x: [120, 140, 110, 130, 120],
                            y: [80, 100, 70, 90, 80],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    >
                        <MousePointer2 size={20} />
                    </motion.div>
                </div>

                <h2 className="text-2xl font-semibold mb-1">Create realtime experiences</h2>
                <p className="text-muted-foreground mb-6">
                   Make a kanban board today in real-time collaboration.
                </p>
            </div>

            <h2 className="heading-L text-black dark:text-white mb-4 mt-4 px-4">Browse All Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 leading-5">
                {boards.map((board) => (
                    <div
                        key={board.id}
                        className="p-6! bg-white dark:bg-[#2b2c37] rounded-lg shadow-xs border hover:border-[#635fc7]! cursor-pointer transition-all no-underline"
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
