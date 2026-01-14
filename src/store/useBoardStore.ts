import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "sonner"

export interface Subtask { id?: string; title: string; isCompleted: boolean; task_id?: string; position?: number; }
export interface Task { id?: string; title: string; description: string; status: string; position: number; subtasks: Subtask[]; column_id?: string; board_id?: string; }
export interface Column { id?: string; name: string; tasks: Task[]; board_id?: string; position?: number; }
export interface Board { id?: string; name: string; isActive: boolean; columns: Column[]; user_id?: string; }

interface BoardState {
    boards: Board[];
    loading: boolean;
    fetchBoards: () => Promise<void>;
    fetchUserBoards: () => Promise<void>;
    addBoard: (name: string, newColumns: Column[]) => Promise<void>; // Changed to async
    editBoard: (name: string, newColumns: Column[]) => Promise<void>;
    deleteBoard: () => Promise<void>;
    setBoardActive: (index: number) => void;
    setActiveBoardById: (boardId: string) => void;
    addTask: (payload: { title: string; status: string; description: string; subtasks: Subtask[]; newColIndex: number }) => Promise<void>;
    editTask: (payload: { title: string; status: string; description: string; subtasks: Subtask[]; prevColIndex: number; newColIndex: number; taskIndex: number }) => Promise<void>;
    dragTask: (colIndex: number, prevColIndex: number, taskIndex: number) => Promise<void>;
    setSubTaskCompleted: (colIndex: number, taskIndex: number, index: number) => Promise<void>;
    setTaskStatus: (payload: { status: string; colIndex: number; newColIndex: number; taskIndex: number }) => Promise<void>;
    deleteTask: (colIndex: number, taskIndex: number) => Promise<void>;
}

const useBoardStore = create<BoardState>()(
    immer((set, get) => ({
        boards: [], // Initialize with empty array
        loading: true,

        fetchUserBoards: async (userId?: string) => {
            const query = supabase.from('boards').select('*');
            if (userId) query.eq('user_id', userId);
            const { data } = await query;
            set({ boards: data || [] });
        },

        fetchBoards: async () => {
            set({ loading: true });
            try {
                const { data: boards, error } = await supabase
                    .from('boards')
                    .select(`
                        *,
                        columns (
                            *,
                            tasks (
                                *,
                                subtasks (*)
                            )
                        )
                    `);

                if (error) {
                    throw new Error(error.message);
                }

                if (boards && boards.length > 0) {
                    // Map is_completed (DB) to isCompleted (Frontend)
                    const mappedBoards = boards.map((board, index) => ({
                        ...board,
                        isActive: index === 0,
                        columns: board.columns.map((col: any) => ({
                            ...col,
                            tasks: col.tasks.map((task: any) => ({
                                ...task,
                                subtasks: task.subtasks.map((sub: any) => ({
                                    ...sub,
                                    isCompleted: sub.is_completed, // Map from DB to UI
                                })),
                            })),
                        })),
                    }));
                    set({ boards: mappedBoards, loading: false });
                } else {
                    set({ boards: [], loading: false });
                }

            } catch (error) {
                toast.error("Error fetching boards:")
                console.error("Error fetching boards:", error);
                set({ loading: false });
            }
        },

        addBoard: async (name, newColumns) => {
            console.log("addBoard: Starting action..."); // DEBUG LOG
            try {
                console.log("addBoard: Attempting to get user..."); // DEBUG LOG
                // 0. Get the current user
                const { data: { user } } = await supabase.auth.getUser();
                console.log("addBoard: User fetched:", user); // DEBUG LOG
                if (!user) {
                    throw new Error("User not authenticated for addBoard action.");
                }

                console.log("addBoard: User authenticated. Inserting board..."); // DEBUG LOG
                // 1. Create the board and get its ID, linking it to the user
                const { data: boardData, error: boardError } = await supabase
                    .from('boards')
                    .insert([{ name, user_id: user.id }]) // Include the user's ID
                    .select()
                    .single();
                console.log("addBoard: Board insert result:", { boardData, boardError }); // DEBUG LOG

                if (boardError) throw boardError;
                if (!boardData) throw new Error("Failed to create board (no data returned).");

                console.log("addBoard: Board created. Inserting columns..."); // DEBUG LOG
                // 2. Create columns linked to the new board
                // Populate user_id on inserts via client: { ..., user_id: supabase.auth.getUser().id }
                const columnsToInsert = newColumns.map((col, index) => ({
                    name: col.name,
                    board_id: boardData.id,
                    user_id: user.id,
                    position: index
                }));

                const { error: columnsError } = await supabase
                    .from('columns')
                    .insert(columnsToInsert);
                console.log("addBoard: Columns insert result:", { columnsError }); // DEBUG LOG

                if (columnsError) throw columnsError;

                console.log("addBoard: Columns created. Fetching all boards..."); // DEBUG LOG
                // 3. Refresh the state from the database to ensure consistency
                await get().fetchBoards();
                console.log("addBoard: Boards re-fetched successfully."); // DEBUG LOG

            } catch (error) {
                toast.error("Error in addBoard action:")
                console.error("Error in addBoard action:", error);
            }
        },

        editBoard: async (name, newColumns) => {
            const board = get().boards.find((b) => b.isActive);
            if (!board?.id) return;

            try {
                // Get user for new column creation
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not authenticated");

                // 1. Update Board Name
                const { error: updateBoardError } = await supabase
                    .from('boards')
                    .update({ name })
                    .eq('id', board.id);

                if (updateBoardError) throw updateBoardError;

                // 2. Handle Columns
                const existingColumnIds = board.columns.map(c => c.id).filter(id => id !== undefined) as string[];
                const newColumnIds = newColumns
                    .map(c => c.id)
                    .filter(id => typeof id === 'string') as string[];

                // Delete removed columns
                const columnsToDelete = existingColumnIds.filter(id => !newColumnIds.includes(id));
                if (columnsToDelete.length > 0) {
                    const { error: deleteError } = await supabase
                        .from('columns')
                        .delete()
                        .in('id', columnsToDelete);
                    if (deleteError) throw deleteError;
                }

                // Process updates and inserts
                for (const [index, col] of newColumns.entries()) {
                    if (col.id && existingColumnIds.includes(col.id)) {
                        // Update existing column
                        const { error } = await supabase
                            .from('columns')
                            .update({ name: col.name, position: index })
                            .eq('id', col.id);
                        if (error) throw error;
                    } else {
                        // Insert new column
                        const { error } = await supabase
                            .from('columns')
                            .insert({
                                name: col.name,
                                board_id: board.id,
                                user_id: user.id,
                                position: index
                            });
                        if (error) throw error;
                    }
                }

                // 3. Refresh State
                await get().fetchBoards();

            } catch (error) {
                toast.error("Error editing board:")
                console.error("Error editing board:", error);
            }
        },

        deleteBoard: async () => {
            const board = get().boards.find((b) => b.isActive);
            if (!board?.id) return;

            try {
                const { error } = await supabase
                    .from('boards')
                    .delete()
                    .eq('id', board.id);

                if (error) throw error;

                await get().fetchBoards();
            }
            catch (error) {
                toast.error("Error deleting board:")
                console.error("Error deleting board:", error);
            }
        },

        setBoardActive: (index) => set((state) => {
            const boardIdToActivate = state.boards[index]?.name;
            if (!boardIdToActivate) return;

            state.boards.forEach((board) => {
                board.isActive = board.name === boardIdToActivate;
            });
        }),

        setActiveBoardById: (boardId) => set((state) => {
            state.boards.forEach((board) => {
                board.isActive = board.id === boardId;
            });
        }),

        addTask: async ({ title, status, description, subtasks, newColIndex }) => {
            try {
                const board = get().boards.find((b) => b.isActive);
                if (!board) throw new Error("No active board found");

                const column = board.columns[newColIndex];
                if (!column || !column.id) throw new Error("Column not found or missing ID");

                // Calculate position based on current tasks in the column
                const position = column.tasks.length;

                // Insert task
                const { data: taskData, error: taskError } = await supabase
                    .from('tasks')
                    .insert({
                        title,
                        description,
                        status: status.toLowerCase(),
                        column_id: column.id,
                        board_id: board.id,
                        position
                    })
                    .select()
                    .single();

                if (taskError) throw taskError;

                // Insert subtasks
                if (subtasks.length > 0) {
                    const subtasksToInsert = subtasks.map((s, index) => ({
                        title: s.title,
                        is_completed: s.isCompleted, // Changed to is_completed to match Supabase schema
                        task_id: taskData.id,
                        position: index // Add position for subtask
                    }));

                    const { error: subtaskError } = await supabase
                        .from('subtasks')
                        .insert(subtasksToInsert);

                    if (subtaskError) throw subtaskError;
                }

                await get().fetchBoards();

            } catch (error) {
                toast.error("Error adding task:")
                console.error("Error adding task:", error);
            }
        },

        editTask: async ({ title, status, description, subtasks, prevColIndex, newColIndex, taskIndex }) => {
            const board = get().boards.find((b) => b.isActive);
            if (!board) return;

            const prevColumn = board.columns[prevColIndex];
            const task = prevColumn.tasks[taskIndex];

            // Task must have an ID to be updated
            if (!(task as any).id) {
                console.error("Task missing ID, cannot update");
                return;
            }
            const taskId = (task as any).id;
            const newColumn = board.columns[newColIndex];

            try {
                // 1. Update Task details
                const { error: taskError } = await supabase
                    .from('tasks')
                    .update({
                        title,
                        description,
                        status: status.toLowerCase(),
                        column_id: newColumn.id,
                    })
                    .eq('id', taskId);

                if (taskError) throw taskError;

                // 2. Handle Subtasks
                // First, delete existing subtasks (simplest approach for now, or you can diff them)
                const { error: deleteSubtasksError } = await supabase
                    .from('subtasks')
                    .delete()
                    .eq('task_id', taskId);

                if (deleteSubtasksError) throw deleteSubtasksError;

                // Insert new subtasks
                if (subtasks.length > 0) {
                    const subtasksToInsert = subtasks.map((s, index) => ({
                        title: s.title,
                        is_completed: s.isCompleted,
                        task_id: taskId,
                        position: index
                    }));

                    const { error: insertSubtasksError } = await supabase
                        .from('subtasks')
                        .insert(subtasksToInsert);

                    if (insertSubtasksError) throw insertSubtasksError;
                }

                // 3. Refresh State
                await get().fetchBoards();

            } catch (error) {
                toast.error("Error editing task:")
                console.error("Error editing task:", error);
            }
        },

        dragTask: async (colIndex, prevColIndex, taskIndex) => {
            const board = get().boards.find((b) => b.isActive);
            if (!board) return;

            const prevColumn = board.columns[prevColIndex];
            const nextColumn = board.columns[colIndex];
            const task = prevColumn.tasks[taskIndex];

            // 1. Optimistic Update
            set((state) => {
                const board = state.boards.find((b) => b.isActive);
                if (board) {
                    const [movedTask] = board.columns[prevColIndex].tasks.splice(taskIndex, 1);
                    board.columns[colIndex].tasks.push(movedTask);
                }
            });

            // 2. Supabase Update
            if (task.id && nextColumn.id) {
                try {
                    const newPosition = nextColumn.tasks.length; // Position is length of existing tasks (since we push to end)

                    const { error } = await supabase.from('tasks').update({
                        column_id: nextColumn.id,
                        position: newPosition
                    }).eq('id', task.id);

                    if (error) throw error;

                } catch (err) {
                    console.error("Failed to update dragged task:", err);
                    // Optionally revert or refetch
                    get().fetchBoards();
                }
            }
        },

        setSubTaskCompleted: async (colIndex, taskIndex, index) => {
            const board = get().boards.find((b) => b.isActive);
            if (!board) return;

            const column = board.columns[colIndex];
            const task = column.tasks[taskIndex];
            const subtask = task.subtasks[index];

            if (!subtask?.id) {
                console.error("Subtask missing ID", subtask);
                return;
            }

            // 1. Optimistic Update
            set((state) => {
                const activeBoard = state.boards.find((b) => b.isActive);
                if (activeBoard) {
                    const st = activeBoard.columns[colIndex]?.tasks[taskIndex]?.subtasks[index];
                    if (st) {
                        st.isCompleted = !st.isCompleted;
                    }
                }
            });

            // 2. Persist
            try {
                const { error } = await supabase
                    .from('subtasks')
                    .update({ is_completed: !subtask.isCompleted })
                    .eq('id', subtask.id);

                if (error) throw error;
            } catch (error) {
                toast.error("Error updating subtask:")
                console.error("Error updating subtask:", error);
                await get().fetchBoards(); // Revert
            }
        },

        setTaskStatus: async ({ status, colIndex, newColIndex, taskIndex }) => set(() => {
            const board = get().boards.find((b) => b.isActive);
            if (!board || colIndex === newColIndex) return;

            const col = board.columns[colIndex]
            const task = col.tasks[taskIndex]
            task.status = status

            col.tasks.splice(taskIndex, 1)
            board.columns[newColIndex].tasks.push(task)
        }),

        deleteTask: async (colIndex, taskIndex) => {
            const board = get().boards.find((b) => b.isActive);
            if (!board) return;

            const column = board.columns[colIndex];
            const task = column.tasks[taskIndex];

            if (!task?.id) {
                toast.error("Cannot delete task: Task ID not found")
                console.error("Cannot delete task: Task ID not found");
                return;
            }

            try {
                // Delete subtasks first
                const { error: subtasksError } = await supabase
                    .from('subtasks')
                    .delete()
                    .eq('task_id', task.id);

                if (subtasksError) throw subtasksError;

                // Delete from Supabase
                const { error } = await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', task.id);

                if (error) throw error;

                // Refresh state
                await get().fetchBoards();

            } catch (error) {
                toast.error("Error deleting task:")
                console.error("Error deleting task:", error);
            }
        },
    }))
);

export default useBoardStore;