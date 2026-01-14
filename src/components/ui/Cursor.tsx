import { useAppContext } from '@/context/AuthProvider'
import { usePresenceStore } from '@/store/usePresenceStore';
import useBoardStore from '@/store/useBoardStore';
import './Cursor.modules.css';
import { MousePointer2 } from 'lucide-react'

const Cursor = () => {
  const { username } = useAppContext();
  const others = usePresenceStore((state) => state.others);
  const me = usePresenceStore((state) => state.me);
  const activeBoard = useBoardStore(state => state.boards.find(b => b.isActive));

  // Combine 'me' and 'others' to render all cursors, including our own.
  const allUsers = me ? [...others, me] : others;   

  return (
    <div className='overlay'>
      {allUsers.map((user) => {
        // Don't render if user has no cursor data
        if (!user.cursor) return null;

        // If the user is another client, only render them if they are on the same board
        if (user.id !== me?.id && user.boardId !== activeBoard?.name) {
          return null;
        }

        return (
          <div
            key={user.id}
            className='cursorWrapper'
            style={{
              left: `${user.cursor.x}%`,
              top: `${user.cursor.y}%`,
              transition: 'all 0.1s linear',
            }}
          >
            <MousePointer2 color={user.color} size={20} />
            {/* user.id === me?.id ? '#635fc7' :  */}
            <div 
              className='nameTag'
              style={{ backgroundColor: user.color || '#635fc7' }}
            >
              {user.name || username}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Cursor;