import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI exists' : 'URI is missing');
        
        // Add connection options
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Add event listeners for connection issues
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        return conn;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error(`Error details: ${error.stack}`);
        process.exit(1);
    }
}

export default connectDB;