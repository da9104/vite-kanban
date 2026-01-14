import './styles/App.css'
import { Routes, Route, Outlet, useParams, useNavigate, Navigate } from 'react-router-dom';
import useBoardStore from '@/store/useBoardStore';
import useThemeStore from '@/store/useThemeStore'
import Header from '@/components/ui/Header'
import EmptyBoard from '@/components/EmptyBoard'
import Board from '@/components/Board';
import Login from '@/components/LoginPage'
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

        <Route path="/share/:boardId" element={<PublicBoardView />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path=":boardId" element={<Home />} />
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
      const ownBoards = userId ? boards.filter(b => b.user_id === userId) : [];

      let targetBoards = ownBoards;
      let activeBoardId;

      if (boardId) {
        // Always allow specific boardId (own or foreign/public)
        const targetBoard = boards.find(b => b.id === boardId);
        if (targetBoard) {
          setActiveBoardById(boardId);
          return;  // No redirect
        }
        // Invalid boardId -> own first
        activeBoardId = ownBoards[0]?.id;
      } else {
        // No boardId -> redirect to own active/first
        activeBoardId = ownBoards.find(b => b.isActive)?.id || ownBoards[0]?.id;
      }

      if (activeBoardId) {
        navigate(`/${activeBoardId}`, { replace: true });
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

function PublicBoardView() {
  const { theme } = useThemeStore()
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { boards, loading, fetchBoards } = useBoardStore();
  const setActiveBoardById = useBoardStore(s => s.setActiveBoardById);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (!loading && boards.length > 0) {
      const board = boards.find(b => b.id === boardId);
      if (board) {
        setActiveBoardById(boardId);
      } else {
        navigate('/login', { replace: true });  // Invalid -> login
      }
    }
  }, [boardId, boards, loading]);

  if (loading || !boards.find(b => b.id === boardId)) return <div>Loading...</div>;

  return <div className={`app ${theme}`}>
    <Header />
    <PresenceManager />
    <Board />
  </div>;
}

export default App

