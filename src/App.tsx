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

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (!loading && boards.length > 0) {
      if (boardId) {
        setActiveBoardById(boardId);
      } else {
        const boardToRedirect = boards.find((b) => b.isActive) || boards[0];
        if (boardToRedirect?.id) {
          navigate(`/${boardToRedirect.id}`, { replace: true });
        }
      }
    }
  }, [boardId, boards, loading, setActiveBoardById, navigate]);

  const { session } = useAppContext();

  if (loading) {
    return <div>Loading boards...</div>
  }

  return (
    <div>
      {session && <PresenceManager />}
      {session ? (boards.length > 0 ? (<Board />) : (<EmptyBoard type="ADD" />)) : <Login />}
    </div>
  )
}

export default App
