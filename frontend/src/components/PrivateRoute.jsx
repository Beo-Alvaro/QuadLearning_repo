import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useEffect } from 'react';
const PrivateRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { user, isAuthenticated, token } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        // Check token on route change
        if (!token) {
            navigate('/', { replace: true });
        }
    }, [token]);

    if (!isAuthenticated || !token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;