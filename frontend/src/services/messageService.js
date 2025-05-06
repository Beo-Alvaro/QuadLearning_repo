import apiConfig from '../config/apiConfig';

// Get the base URL dynamically
const getBaseUrl = () => apiConfig.getBaseUrl();

// Send Message
export const sendMessage = async (content, recipientId, token) => {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content, recipientId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to send message');
        }

        return response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Get Messages for Admin
export const getAdminMessages = async (token) => {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/messages/getMessages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,  // Ensure token is included
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch admin messages');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching admin messages:', error);
        throw error;
    }
};


// Mark Message as Read
export const markMessageAsRead = async (messageId, token) => {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/messages/read/${messageId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to mark message as read');
        }

        return response.json();
    } catch (error) {
        console.error('Error marking message as read:', error);
        throw error;
    }
};

export const fetchAdminId = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found for admin ID fetch');
            return null;
        }
        
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/users/adminId`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch admin ID');
        }

        const data = await response.json();
        return data.adminId;
    } catch (error) {
        console.error('Failed to fetch admin ID:', error);
        return null;
    }
};

