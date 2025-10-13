import { db } from '#config/database';
import { users } from '#models/user.model';
import logger from '#config/logger';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    throw new Error('Failed to fetch users');
  }
};

export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    return user[0];
  } catch (err) {
    if (err.message === 'User not found') {
      throw err;
    }
    logger.error('Error fetching user by ID:', err);
    throw new Error('Failed to fetch user');
  }
};

export const updateUser = async (id, updates) => {
  try {
    // Check if user exists first
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    // Prepare update data
    const updateData = { ...updates };

    // Hash password if it's being updated
    if (updates.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updates.password, saltRounds);
    }

    // Add updated timestamp
    updateData.updated_at = new Date();

    // Perform the update
    await db.update(users).set(updateData).where(eq(users.id, id));

    // Return the updated user (excluding password)
    const updatedUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return updatedUser[0];
  } catch (err) {
    if (err.message === 'User not found') {
      throw err;
    }
    logger.error('Error updating user:', err);
    throw new Error('Failed to update user');
  }
};

export const deleteUser = async id => {
  try {
    // Check if user exists first
    const existingUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, id));

    // Return the deleted user info
    return existingUser[0];
  } catch (err) {
    if (err.message === 'User not found') {
      throw err;
    }
    logger.error('Error deleting user:', err);
    throw new Error('Failed to delete user');
  }
};
