import React, { createContext, useState } from 'react';

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
            const response = await fetch('/api/admin/getUsers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const json = await response.json();
                setUsers(json);
            } else {
                console.error('Failed to fetch users:', response.status);
                setError('Failed to fetch users');
            }
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
            const response = await fetch(`/api/admin/resetPassword/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newPassword }),
            });

            if (response.ok) {
                console.log('New password set')
                alert('Password reset successful');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to reset password');
                alert('Failed to reset password');
            }
        } catch (error) {
            setError('An error occurred while resetting the password');
            alert('An error occurred while resetting the password');
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
