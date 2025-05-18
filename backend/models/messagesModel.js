import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the user who sent the message
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the admin who will receive it
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['unread', 'read'],
            default: 'unread',
        }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt timestamps
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
