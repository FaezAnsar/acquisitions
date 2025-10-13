import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/users.controller';
import { authenticateToken } from '#middlewares/auth.middleware';
import express from 'express';

const router = express.Router();

// Get all users (requires authentication)
router.get('/', authenticateToken, fetchAllUsers);

// Get user by ID (requires authentication)
router.get('/:id', authenticateToken, fetchUserById);

// Update user by ID (requires authentication and proper authorization)
router.put('/:id', authenticateToken, updateUserById);

// Delete user by ID (requires authentication and proper authorization)
router.delete('/:id', authenticateToken, deleteUserById);

export default router;
