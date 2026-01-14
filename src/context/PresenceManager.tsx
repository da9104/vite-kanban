import { useEffect } from 'react';
import { usePresenceStore } from '@/store/usePresenceStore';
import useBoardStore from '@/store/useBoardStore'; // Import board store
import { socket } from '@/lib/socket';
import type { User, Cursor } from '@/store/usePresenceStore';

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
  const { me, setMyCursor, setOthers, addOther, updateOtherCursor, removeOther } = usePresenceStore();
  const activeBoard = useBoardStore(state => state.boards.find(b => b.isActive)); // Get active board

  // Effect to handle this client's mouse movements
  useEffect(() => {
    const handleMouseMove = throttle((event: MouseEvent) => {
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;

      // Update our own cursor in the local store
      setMyCursor({ x, y });

      // Broadcast our cursor position to others, including the boardId
      if (me && activeBoard) {
        socket.emit('cursor-move', { 
          id: me.id, 
          cursor: { x, y },
          boardId: activeBoard.name // Send the board ID
        });
      }
    }, 50); // Throttle to 20 times per second

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setMyCursor, me, activeBoard]); // Add activeBoard to dependencies

  // Effect to listen for socket events from the server
  useEffect(() => {
    
    const onConnect = () => {
      if (me) socket.emit('join-app', me);
    }

    const onOthers = (users: User[]) => {
      setOthers(users);
    }

    const onUserJoined = (user: User) => {
      addOther(user);
    }

    // Listen for cursor updates from other users
    const onCursorUpdate = ({ id, cursor, boardId }: { id: string, cursor: Cursor, boardId: string }) => {
      updateOtherCursor(id, cursor, boardId);
    }

    const onUserLeave = ({ id }: { id: string }) => {
      removeOther(id);
    }

    socket.on('connect', onConnect);
    socket.on('others-present', onOthers);
    socket.on('user-joined', onUserJoined);
    socket.on('cursor-update', onCursorUpdate);
    socket.on('user-leave', onUserLeave);

    return () => {
      socket.off('connect', onConnect);
      socket.off('others-present', onOthers);
      socket.off('user-joined', onUserJoined);
      socket.off('cursor-update', onCursorUpdate);
      socket.off('user-leave', onUserLeave);
    };
  }, [me, setOthers, addOther, updateOtherCursor, removeOther]);

  return null; // This component does not render anything
};

export default PresenceManager;
