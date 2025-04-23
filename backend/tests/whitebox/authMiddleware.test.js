import { describe, test, expect, beforeEach, afterAll, vi } from 'vitest';
import { protect, authorizeRoles } from '../../middleware/authMiddleware.js';
import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';

// Mock dependencies properly
vi.mock('jsonwebtoken', () => {
  return {
    default: {
      verify: vi.fn()
    },
    verify: vi.fn()
  };
});

vi.mock('../../models/userModel.js', () => {
  return {
    default: {
      findById: vi.fn()
    }
  };
});

describe('Auth Middleware - Whitebox Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('protect middleware', () => {
    test('Should return 401 if no authorization header', async () => {
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('Should return 401 if token verification fails', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
      expect(next).not.toHaveBeenCalled();
    });

    test('Should return 401 if user not found', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockResolvedValue(null);

      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    test('Should set req.user and call next if token is valid', async () => {
      const mockUser = { _id: 'user123', username: 'testuser', role: 'admin' };
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      await protect(req, res, next);
      
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalledWith('user123');
    });
  });

  describe('authorizeRoles middleware', () => {
    test('Should call next if user has required role', () => {
      req.user = { role: 'admin' };
      const middleware = authorizeRoles('admin', 'superadmin');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('Should call next if user is superadmin regardless of required role', () => {
      req.user = { role: 'superadmin' };
      const middleware = authorizeRoles('admin', 'teacher');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('Should set status 403 for unauthorized role', () => {
      req.user = { role: 'student' };
      const middleware = authorizeRoles('admin', 'teacher');
      
      try {
        middleware(req, res, next);
      } catch (error) {
        // Suppress the error
      }
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 