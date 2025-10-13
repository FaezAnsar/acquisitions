import logger from '#config/logger';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service';
import { formatValidationErrors } from '#utils/format';
import { updateUserSchema, userIdSchema } from '#validations/users.validation';

export const fetchAllUsers = async (req, res) => {
  try {
    logger.info('Fetching all users from the database');
    const usersList = await getAllUsers();
    // Exclude passwords from the returned user objects
    return res.json({
      message: 'Users fetched successfully',
      users: usersList,
      count: usersList.length,
    });
  } catch (err) {
    logger.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Could not fetch users' });
  }
};

export const fetchUserById = async (req, res) => {
  try {
    // Validate request parameters
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      logger.warn('Invalid user ID provided', { id: req.params.id });
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;
    logger.info(`Fetching user by ID: ${id}`);

    const user = await getUserById(id);

    return res.json({
      message: 'User fetched successfully',
      user,
    });
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: 'Could not fetch user' });
  }
};

export const updateUserById = async (req, res) => {
  try {
    // Validate request parameters
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      logger.warn('Invalid user ID provided', { id: req.params.id });
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      logger.warn('Invalid update data provided', { userId: req.params.id });
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // Authorization checks
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Users can only update their own information
    if (currentUserId !== id && currentUserRole !== 'admin') {
      logger.warn('Unauthorized update attempt', {
        currentUserId,
        targetUserId: id,
        role: currentUserRole,
      });
      return res.status(403).json({
        error: 'Access denied. You can only update your own information.',
      });
    }

    // Only admins can change user roles
    if (updates.role && currentUserRole !== 'admin') {
      logger.warn('Unauthorized role change attempt', {
        currentUserId,
        targetUserId: id,
        role: currentUserRole,
      });
      return res.status(403).json({
        error: 'Access denied. Only admins can change user roles.',
      });
    }

    logger.info(`Updating user: ${id}`, {
      updatedBy: currentUserId,
      updates: Object.keys(updates),
    });

    const updatedUser = await updateUser(id, updates);

    return res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    logger.error('Error updating user:', err);
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: 'Could not update user' });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    // Validate request parameters
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      logger.warn('Invalid user ID provided', { id: req.params.id });
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Authorization checks - users can delete their own account or admins can delete any account
    if (currentUserId !== id && currentUserRole !== 'admin') {
      logger.warn('Unauthorized delete attempt', {
        currentUserId,
        targetUserId: id,
        role: currentUserRole,
      });
      return res.status(403).json({
        error:
          'Access denied. You can only delete your own account or must be an admin.',
      });
    }

    logger.info(`Deleting user: ${id}`, { deletedBy: currentUserId });

    const deletedUser = await deleteUser(id);

    return res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (err) {
    logger.error('Error deleting user:', err);
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: 'Could not delete user' });
  }
};
