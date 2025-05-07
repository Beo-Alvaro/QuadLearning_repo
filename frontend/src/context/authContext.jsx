import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchAdminId } from '../services/messageService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        // Check for stored credentials on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('userInfo');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const getAdmin = async () => {
            if (token && user && !adminId) { // Ensure token and user are both set
                try {
                    const id = await fetchAdminId();
                    if (id) setAdminId(id);
                } catch (error) {
                    console.error('Failed to fetch admin ID:', error);
                }
            }
        };
        getAdmin();
    }, [token, user, adminId]);

    const login = async (newToken, userData) => {
        try {
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('userInfo', JSON.stringify(userData));

            if (userData.role === 'student') {
                const id = await fetchAdminId();
                if (id) setAdminId(id);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
        }
    };

    const logout = async () => {
        const currentToken = localStorage.getItem('token');
        try {
            const response = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                }
            });
    
            // Clear state and storage regardless of response
            setUser(null);
            setToken('');
            setAdminId(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
    
            if (!response.ok) {
                throw new Error('Logout failed');
            }
    
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear everything even if the request fails
            setUser(null);
            setToken('');
            setAdminId(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/';
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) return;
    
            try {
                const response = await fetch('/api/users/verify-token', {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    await logout();
                    return;
                }
    
                const data = await response.json();
                if (!data.valid) {
                    await logout();
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                await logout();
            }
        };
    
        verifyToken();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            loading, 
            error, 
            login, 
            logout, 
            adminId,
            isAuthenticated: !!token && !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
