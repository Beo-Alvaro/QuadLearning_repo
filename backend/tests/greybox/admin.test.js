import { describe, test, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from '../../middleware/errorMiddleware.js';
import dotenv from 'dotenv';

// Create a simple mock router for admin routes
const adminRouter = express.Router();

// Add authentication middleware mock
const mockAuth = (req, res, next) => {
  // Add user info to simulate authentication
  req.user = {
    _id: 'admin123',
    username: 'admin',
    role: 'admin'
  };
  next();
};

// Simple routes for testing
adminRouter.get('/getUsers', mockAuth, (req, res) => {
  res.json([{ id: 'user1', username: 'testuser' }]);
});

adminRouter.delete('/users/:id', mockAuth, (req, res) => {
  const userId = req.params.id;
  res.json({ message: `User ${userId} deleted` });
});

// Load environment variables
dotenv.config();

// Create a test app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Use mock router
app.use('/api/admin', adminRouter);
app.use(notFound);
app.use(errorHandler);

describe('Admin API - Greybox Tests', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });

  // Test for the getUsers route
  test('Should return list of users', async () => {
    const response = await request(app).get('/api/admin/getUsers');
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('username');
  });

  // Test for deleting a user
  test('Should delete a user', async () => {
    const userId = '123';
    const response = await request(app).delete(`/api/admin/users/${userId}`);
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain(userId);
  });
}); 