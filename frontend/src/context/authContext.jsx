import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchAdminId } from '../services/messageService';
import apiConfig from '../config/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('userInfo');

            if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
                setToken(storedToken);
            } else {
                // Clear invalid token
                localStorage.removeItem('token');
            }
            
            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser && typeof parsedUser === 'object') {
                        setUser(parsedUser);
                    } else {
                        // Clear invalid user data
                        localStorage.removeItem('userInfo');
                    }
                } catch (e) {
                    console.error('Error parsing stored user info:', e);
                    // If there's an error parsing, clear the invalid data
                    localStorage.removeItem('userInfo');
                }
            } else {
                // Clear invalid user info
                localStorage.removeItem('userInfo');
            }
        } catch (err) {
            console.error('Error loading auth data from localStorage:', err);
            // Clear potentially corrupted data
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
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
        
        if (token && user) {
            getAdmin();
        }
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
                
                // Validate the response data
                if (!data.token || !data.user || typeof data.user !== 'object') {
                    throw new Error('Invalid response from server');
                }
                
                // Clear existing storage first
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                
                // Then set new values
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));
            
                // Fetch adminId right after login
                if (data.user.role === 'student') {
                    const id = await fetchAdminId();
                    if (id) setAdminId(id);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred while logging in');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken('');
        setAdminId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, logout, adminId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
