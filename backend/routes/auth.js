import express from 'express';
import { User } from '../database.js';
import { generateToken } from '../middleware/auth.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// POST /signup - Register a new user
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Create new user
    const newUser = User.create(email, password);
    
    // Generate JWT token
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login - Authenticate user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
