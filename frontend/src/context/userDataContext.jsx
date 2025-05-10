import React, { createContext, useState } from 'react';
import { apiRequest } from '../utils/api';

export const UserDataContext = createContext();

export const UserContextProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Function to fetch users
    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        if (!token) {
            console.log('No token found, skipping fetch.');
            return;
        }

        try {
            setLoading(true);
            const json = await apiRequest('/api/admin/getUsers', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setUsers(json);
        } catch (error) {
            console.error('Error fetching users:', error.message);
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    // Optional: You could call fetchUsers here if you want to trigger it based on certain conditions

    const handleResetPassword = async (userId, newPassword) => {
        const token = localStorage.getItem('token');

        try {
            setLoading(true);
            await apiRequest(`/api/admin/resetPassword/${userId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newPassword }),
            });
            
            console.log('New password set');
        } catch (error) {
            setError(error.message || 'An error occurred while resetting the password');
            alert(error.message || 'An error occurred while resetting the password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserDataContext.Provider value={{ users, loading, error, handleResetPassword, fetchUsers }}>
            {children}
        </UserDataContext.Provider>
    );
};

export default UserContextProvider;
