import Message from '../models/messagesModel.js';
import User from '../models/userModel.js';

// Send Message
export const sendMessage = async (req, res) => {
    try {
        console.log("Sender (req.user):", req.user); // Check this!

        const { recipientId, content } = req.body;
        const senderId = req.user.id;

        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.role !== 'admin') {
            return res.status(400).json({ message: "Recipient must be an admin" });
        }

        const newMessage = new Message({ sender: senderId, recipient: recipientId, content });
        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Send message error:", error); // Catch server errors
        res.status(500).json({ message: "Server error", error });
    }
};


// Get Messages for Admin
export const getAdminMessages = async (req, res) => {
    console.log('getAdminMessages endpoint hit');
    console.log('req.user:', req.user);
    try {
        const adminId = req.user.id; // Ensure user is admin via authentication
        const messages = await Message.find({ recipient: adminId }).populate('sender', 'username');

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Mark Message as Read
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findByIdAndUpdate(messageId, { status: 'read' }, { new: true });

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
