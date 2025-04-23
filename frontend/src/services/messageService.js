const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_URL = `${API_BASE_URL}/messages`; // Base URL for messages

// Send Message
export const sendMessage = async (content, recipientId, token) => {
    const response = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, recipientId }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
};

// Get Messages for Admin
export const getAdminMessages = async (token) => {
    const response = await fetch(`${API_URL}/getMessages`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,  // Ensure token is included
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch admin messages');
    }

    return response.json();
};


// Mark Message as Read
export const markMessageAsRead = async (messageId, token) => {
    const response = await fetch(`${API_URL}/read/${messageId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to mark message as read');
    }

    return response.json();
};

export const fetchAdminId = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/adminId`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.adminId;
    } catch (error) {
        console.error('Failed to fetch admin ID:', error);
        return null;
    }
};

