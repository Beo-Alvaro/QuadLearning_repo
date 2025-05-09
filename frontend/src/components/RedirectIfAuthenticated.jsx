import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const RedirectIfAuthenticated = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (isAuthenticated && user) {
        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin/home" replace />;
            case 'teacher':
                return <Navigate to="/teacher/home" replace />;
            case 'student':
                return <Navigate to="/student/home" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default RedirectIfAuthenticated;