import { apiRequest } from '../utils/api';

// Send Message
export const sendMessage = async (content, recipientId, token) => {
    return apiRequest('/api/messages/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, recipientId }),
    });
};

// Get Messages for Admin
export const getAdminMessages = async (token) => {
    return apiRequest('/api/messages/getMessages', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Mark Message as Read
export const markMessageAsRead = async (messageId, token) => {
    return apiRequest(`/api/messages/read/${messageId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const fetchAdminId = async () => {
    try {
        return await apiRequest('/api/users/adminId', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    } catch (error) {
        console.error('Failed to fetch admin ID:', error);
        return null;
    }
};

