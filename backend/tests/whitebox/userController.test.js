import { describe, test, expect, beforeEach, vi } from 'vitest';
import { authUser, logoutUser, getAdminId } from '../../controllers/userController.js';
import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import generateToken from '../../utils/generateToken.js';

// Mock dependencies
vi.mock('../../models/userModel.js', () => {
  return {
    default: {
      findOne: vi.fn()
    }
  };
});

vi.mock('bcryptjs', () => {
  return {
    compare: vi.fn()
  };
});

vi.mock('crypto-js', () => {
  return {
    AES: {
      decrypt: vi.fn().mockReturnValue({
        toString: vi.fn().mockReturnValue('decryptedPassword')
      })
    }
  };
});

vi.mock('../../utils/generateToken.js', () => {
  return {
    default: vi.fn().mockReturnValue('mockToken')
  };
});

describe('User Controller - Whitebox Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn()
    };
    next = vi.fn(err => { 
      if (err) throw err;
    });
    vi.clearAllMocks();
    process.env.VITE_ENCRYPTION_KEY = 'testEncryptionKey';
  });

  describe('authUser', () => {
    test('Should decrypt password when isEncrypted is true', async () => {
      req.body = {
        username: 'testuser',
        password: 'encryptedPassword',
        isEncrypted: true
      };
      
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'admin',
        loginAttempts: 0,
        resetLoginAttempts: vi.fn().mockResolvedValue(undefined)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      
      await authUser(req, res, next);
      
      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encryptedPassword', 'testEncryptionKey');
      expect(bcrypt.compare).toHaveBeenCalledWith('decryptedPassword', 'hashedPassword');
      expect(mockUser.resetLoginAttempts).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith('user123', res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'mockToken'
      }));
    });
    
    test('Should handle user not found', async () => {
      req.body = {
        username: 'nonexistent',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue(null);
      
      await expect(authUser(req, res, next)).rejects.toThrow('Invalid username or password');
      expect(res.status).toHaveBeenCalledWith(401);
    });
    
    test('Should handle locked account', async () => {
      req.body = {
        username: 'lockeduser',
        password: 'password123'
      };
      
      // Create a date 10 minutes in the future
      const lockTime = new Date(Date.now() + 10 * 60 * 1000);
      
      const mockUser = {
        _id: 'user123',
        username: 'lockeduser',
        password: 'hashedPassword',
        lockUntil: lockTime
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      await expect(authUser(req, res, next)).rejects.toThrow(/Account is locked/);
      expect(res.status).toHaveBeenCalledWith(423);
    });
    
    test('Should increment login attempts on wrong password', async () => {
      req.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };
      
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashedPassword',
        loginAttempts: 2,
        incrementLoginAttempts: vi.fn().mockResolvedValue(undefined)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(authUser(req, res, next)).rejects.toThrow(/Invalid password/);
      expect(mockUser.incrementLoginAttempts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logoutUser', () => {
    test('Should clear the cookie and return success message', async () => {
      await logoutUser(req, res);
      
      expect(res.cookie).toHaveBeenCalledWith('token', '', expect.objectContaining({
        httpOnly: true,
        expires: expect.any(Date)
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });
  });

  describe('getAdminId', () => {
    test('Should return admin ID when admin exists', async () => {
      const mockAdmin = {
        _id: 'admin123',
        role: 'admin'
      };
      
      User.findOne.mockResolvedValue(mockAdmin);
      
      await getAdminId(req, res);
      
      expect(User.findOne).toHaveBeenCalledWith({ role: 'admin' });
      expect(res.json).toHaveBeenCalledWith({ adminId: 'admin123' });
    });
    
    test('Should return 404 when admin not found', async () => {
      User.findOne.mockResolvedValue(null);
      
      await getAdminId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin user not found' });
    });
    
    test('Should handle errors properly', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      await getAdminId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });
}); 