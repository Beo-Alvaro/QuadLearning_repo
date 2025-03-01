const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const superadminRoutes = require('./routes/superadminRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const teacherRoutes = require('./routes/teacherRoutes.js');
const semesterRoutes = require('./routes/semesterRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');

dotenv.config(); // Load environment variables
const port = process.env.PORT || 5000;

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // Middleware for parsing cookies

// Connect to the database
connectDB()
    .then(() => {
        console.log('Connected to MongoDB');

        // Start the server
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit if the server cannot start
    });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', semesterRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/messages', messageRoutes);
// Basic route
app.get('/', (req, res) => res.send('Server is ready'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);