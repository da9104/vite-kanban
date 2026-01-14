import './styles/App.css'
import { Routes, Route, Outlet, useParams, useNavigate } from 'react-router-dom';
import useBoardStore from '@/store/useBoardStore';
import useThemeStore from '@/store/useThemeStore'
import Header from '@/components/ui/Header'
import EmptyBoard from '@/components/EmptyBoard'
import Board from '@/components/Board';
import Login from '@/components/Login'
import { AuthProvider, useAppContext } from '@/context/AuthProvider';
import PresenceManager from '@/context/PresenceManager'
import { useEffect } from 'react';
// import BoardCard from '@/components/BoardCard';
import { Toaster } from "@/components/ui/Sonner"


function Layout() {
  const { theme } = useThemeStore()

  return (
    <>
      <div className={`app ${theme}`}>
        <Header />
        <Outlet />
      </div>
    </>
  )
}

function App() {


  return (
    <AuthProvider>
      <Toaster />
      <Routes>
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
    if (!loading) {
      if (boards.length > 0) {
        if (boardId) {
          const boardExists = boards.some(b => b.id === boardId);
          if (boardExists) {
            setActiveBoardById(boardId);
          } else {
            // If the boardId doesn't exist, redirect to the first available board
            if (boards[0]?.id) navigate(`/${boards[0].id}`, { replace: true });
          }
        } else {
          // If no boardId in URL, try to find the active one or default to the first one
          const boardToRedirect = boards.find((b) => b.isActive) || boards[0];
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

  // If no boards at all, show EmptyBoard (for logged-in users) or EmptyBoard (for guests, but they can't create)
  if (boards.length === 0) {
    return (
      <div>
        {session && <PresenceManager />}
        <EmptyBoard type="ADD" />
      </div>
    );
  }

  // If there are boards
  if (session) {
    // User is logged in, show the Board
    return (
      <div>
        {session && <PresenceManager />}
        <Board />
      </div>
    );
  } else {
    // User is not logged in, but there are boards, so show login (where they can browse)
    return (
      <div>
        {/* PresenceManager is only for logged in users */}
        <Login />
      </div>
    );
  }
}

export default App

