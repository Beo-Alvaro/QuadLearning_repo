import { describe, test, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from '../../middleware/errorMiddleware.js';
import userRoutes from '../../routes/userRoutes.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes);
app.use(notFound);
app.use(errorHandler);

// Mocking manually without jest.mock
import User from '../../models/userModel.js';

// Mock User methods
User.findOne = vi.fn();
User.findById = vi.fn();

describe('Auth API - Greybox Tests', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterAll(async () => {
    // Cleanup
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });

  describe('POST /api/users/auth', () => {
    test('Should return 401 with invalid username', async () => {
      // Setup mock to return null for user lookup (user not found)
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/users/auth')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistent' });
    });

    // Other tests commented out for now
  });
}); 