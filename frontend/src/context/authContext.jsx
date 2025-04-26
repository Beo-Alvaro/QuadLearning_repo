import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchAdminId } from '../services/messageService';
import apiConfig from '../config/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminId, setAdminId] = useState(null);
    
    let storedToken;

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('userInfo');

        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        console.log(storedToken)
    }, [storedToken]);

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

    const login = async (username, password) => {
        try {
            setLoading(true);
            const baseUrl = apiConfig.getBaseUrl();
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            
                // Fetch adminId right after login
                if (data.user.role === 'student') {
                    const id = await fetchAdminId();
                    if (id) setAdminId(id);
                }
            }else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred while logging in');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken('');
        setAdminId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, logout, adminId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
