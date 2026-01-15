import useBoardStore from '@/store/useBoardStore';
import { usePresenceStore } from '@/store/usePresenceStore';
import { useEffect } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';
import { motion } from "framer-motion"
import { MousePointer2 } from 'lucide-react'
import BoardCards from '@/components/ui/BoardCards'

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
        <div className="flex flex-col gap-4 leading-9 justify-center items-center">
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
                    Make your board today, collaborate right away
                </p>
            </div>

            <h2 className="heading-L text-black dark:text-white mb-4 mt-4 px-4">Browse All Boards</h2>
           
            <section className="bg-background p-8 flex w-full max-w-4xl mx-auto">
                <BoardCards boards={boards} handleClick={handleClick} getOwnerName={getOwnerName} />
            </section>
        </div>
    );
}
