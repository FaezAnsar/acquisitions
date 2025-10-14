import logger from '#config/logger';

import { formatValidationErrors } from '#utils/format';
import { signUpSchema, signInSchema } from '#validations/auth.validation';
import { jwttoken } from '#utils/jwt';
import { createUser, authenticateUser } from '#services/auth.service';
import { cookies } from '#utils/cookies';
export const signup = async (req, res, _next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { name, email, password, role } = validationResult.data;

    //auth Service
    const user = await createUser({ name, email, password, role });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`User registered successfully: ${email}`);
    res.status(200).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signup error:', e);
    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signin = async (req, res, _next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    // Authenticate user
    const user = await authenticateUser({ email, password });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signin error:', e);
    if (e.message === 'Invalid email or password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signout = async (req, res, _next) => {
  try {
    // Clear the authentication cookie
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (e) {
    logger.error('Signout error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
