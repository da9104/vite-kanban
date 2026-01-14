import './styles/App.css'
import { Routes, Route, Outlet, useParams, useNavigate, Navigate } from 'react-router-dom';
import useBoardStore from '@/store/useBoardStore';
import useThemeStore from '@/store/useThemeStore'
import Header from '@/components/ui/Header'
import EmptyBoard from '@/components/EmptyBoard'
import Board from '@/components/Board';
import Login from '@/components/Login'
import { AuthProvider, useAppContext } from '@/context/AuthProvider';
import PresenceManager from '@/context/PresenceManager'
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/Sonner"


function Layout() {
  const { theme } = useThemeStore()
  const { session } = useAppContext();
  if (!session) return <Navigate to="/login" replace />;
  return (
      <div className={`app ${theme}`}>
        <Header />
        <Outlet />
      </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        {/* Public login route - no layout */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path=":boardId" element={<Home />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

function Home() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { boards, loading, fetchBoards } = useBoardStore();
  const setActiveBoardById = useBoardStore((state) => state.setActiveBoardById)
  const { session } = useAppContext();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (!loading && boards.length > 0) {
      const userId = session?.user?.id;
      const filteredBoards = userId 
        ? boards.filter(board => board.user_id === userId) 
        : boards;  // Guests see all (or implement public filter)

      if (filteredBoards.length > 0) {
        if (boardId) {
          const boardExists = filteredBoards.some(b => b.id === boardId);
          if (boardExists) {
            setActiveBoardById(boardId);
          } else if (filteredBoards[0]?.id) {
            navigate(`/${filteredBoards[0].id}`, { replace: true });
          }
        } else {
          const boardToRedirect = filteredBoards.find(b => b.isActive) || filteredBoards[0];
          if (boardToRedirect?.id) {
            navigate(`/${boardToRedirect.id}`, { replace: true });
          }
        }
      }
    }
  }, [boardId, boards, loading, setActiveBoardById, navigate, session]);

  if (loading) {
    return <div>Loading boards...</div>;
  }

  if (boards.length === 0) {
    return session ? <EmptyBoard type="ADD" /> : null;  // Guests shouldn't create
  }

  return (
    <div>
      <PresenceManager />  {/* Only renders if session exists */}
      <Board />
    </div>
  );
}

export default App

