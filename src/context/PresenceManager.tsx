import { useEffect } from 'react';
import { usePresenceStore } from '@/store/usePresenceStore';
import useBoardStore from '@/store/useBoardStore';
import { supabase } from '@/lib/supabaseClient';
import type { User, Cursor } from '@/store/usePresenceStore';
import { RealtimeChannel } from '@supabase/supabase-js';

// A simple throttle function to limit how often we send events
const throttle = (func: (...args: any[]) => void, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const PresenceManager = () => {
  const { me, setMyCursor, setOthers, updateOtherCursor } = usePresenceStore();
  const activeBoard = useBoardStore(state => state.boards.find(b => b.isActive));

  useEffect(() => {
    if (!me) return;

    const channel = supabase.channel('room1');

    const handleMouseMove = throttle((event: MouseEvent) => {
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;

      // Update our own cursor in the local store
      setMyCursor({ x, y });

      // Broadcast our cursor position via Supabase
      if (activeBoard) {
        channel.send({
          type: 'broadcast',
          event: 'cursor-move',
          payload: {
            id: me.id,
            cursor: { x, y },
            boardId: activeBoard.name
          }
        });
      }
    }, 50);

    // Subscribe to the channel
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users: User[] = [];
        
        // Flatten the presence state object into an array of users
        for (const id in newState) {
          const userStates = newState[id] as unknown as User[];
          // Typically we just take the first state object for a given presence key (user)
          // Adjust based on if you allow multiple sessions per user or not.
          // Here we filter out ourself implicitly in the store, but good to check.
          userStates.forEach(user => {
             if (user.id !== me.id) {
               users.push(user);
             }
          });
        }
        setOthers(users);
      })
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
         const { id, cursor, boardId } = payload.payload;
         updateOtherCursor(id, cursor, boardId);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
           // Track our presence once connected
           await channel.track(me);
        }
      });

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      supabase.removeChannel(channel);
    };
  }, [me, activeBoard, setMyCursor, setOthers, updateOtherCursor]);

  return null; 
};

export default PresenceManager;
