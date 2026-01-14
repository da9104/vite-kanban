import './ElipsisMenu.css'
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AuthProvider'


interface ElipsisMenuProps {
    type: string;
    setOpenEditModal: () => void;
    setOpenDeleteModal: () => void;
    handleLogout?: () => void;
}

export default function ElipsisMenu({ type, setOpenEditModal, setOpenDeleteModal, handleLogout }: ElipsisMenuProps) {
    const { session, username } = useAppContext();

    if (!session) {
        return (
            <div className="elipsis-menu text-L">
                <p>
                    <Link to='/login'>Login</Link>
                </p>
            </div>
        )
    }

    return (
        <div className="elipsis-menu text-L">
            <p onClick={() => setOpenEditModal()}>Edit</p>
            <p onClick={() => setOpenDeleteModal()} className="elipsis-menu-red">
                Delete {type}
            </p>
        </div>
    )
}