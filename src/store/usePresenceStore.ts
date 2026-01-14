import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Cursor { x: number; y: number; }

export interface User {
  id: string; // This should be the Supabase UID
  email: string;
  name?: string;
  avatar_url?: string;
  color?: string;
  cursor?: Cursor;
  boardId?: string; // The ID of the board the user's cursor is on
}

interface PresenceState {
  me: User | null;
  others: User[];
  
  // Actions
  setMe: (user: User | null) => void;
  setMyCursor: (cursor: Cursor) => void;
  setOthers: (users: User[]) => void;
  addOther: (user: User) => void;
  updateOtherCursor: (userId: string, cursor: Cursor, boardId: string) => void;
  removeOther: (userId: string) => void;
}

export const usePresenceStore = create<PresenceState>()(
  immer((set) => ({
    me: null,
    others: [],

    setMe: (user) => set((state) => {
      state.me = user;
    }),

    setMyCursor: (cursor) => set((state) => {
      if (state.me) {
        state.me.cursor = cursor;
      }
    }),

    setOthers: (users) => set((state) => {
      // When setting others, filter out the current user
      state.others = users.filter(u => u.id !== state.me?.id);
    }),
    
    addOther: (user) => set((state) => {
      // Don't add yourself to the 'others' list
      if (user.id === state.me?.id) return;
      // Avoid adding duplicates
      if (!state.others.some(u => u.id === user.id)) {
        state.others.push(user);
      }
    }),

    updateOtherCursor: (userId, cursor, boardId) => set((state) => {
      const user = state.others.find((u) => u.id === userId);
      if (user) {
        user.cursor = cursor;
        user.boardId = boardId;
      }
    }),

    removeOther: (userId) => set((state) => {
      state.others = state.others.filter((u) => u.id !== userId);
    }),
  }))
);

