import logger from '#config/logger';
import bcrypt from 'bcrypt';
import { db } from '#config/database';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';
export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    logger.error('Password hashing error:', err);
    throw new Error('Password hashing failed');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    logger.error('Password comparison error:', err);
    throw new Error('Password comparison failed');
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    // Find user by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = existingUser[0];

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    logger.info(`User authenticated successfully: ${email}`);
    return userWithoutPassword;
  } catch (err) {
    logger.error('User authentication error:', err);
    throw err;
  }
};

export const createUser = async ({ name, email, password, role }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0)
      throw new Error('User with this email already exists');
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    // Simulate user creation and return user object
    logger.info(`User created with email: ${email}`);
    return newUser;
  } catch (err) {
    logger.error('User creation error:', err);
    throw new Error('User creation failed');
  }
};
