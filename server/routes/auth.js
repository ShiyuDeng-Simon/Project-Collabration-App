const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { validateEmail } = require('../middleware/validation');

// Register user (for non-OAuth users)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM appUser WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await pool.query(
      'INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ($1, $2, $3, $4, $5)',
      [userId, hashedPassword, firstName, lastName, email]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, firstName, lastName },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { userId, email, firstName, lastName }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userResult = await pool.query(
      'SELECT * FROM appUser WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    // Note: PostgreSQL returns column names in lowercase unless quoted
    const token = jwt.sign(
      {
        userId: user.userid || user.userID,
        email: user.email,
        firstName: user.firstname || user.firstName,
        lastName: user.lastname || user.lastName
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userid || user.userID,
        email: user.email,
        firstName: user.firstname || user.firstName,
        lastName: user.lastname || user.lastName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth callback - create or get user
router.post('/google-auth', async (req, res) => {
  try {
    const { email, firstName, lastName, googleId } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if user exists
    let userResult = await pool.query(
      'SELECT * FROM appUser WHERE email = $1',
      [email]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Create new user
      const userId = uuidv4();
      // For OAuth users, we can use a random password or null
      const randomPassword = await bcrypt.hash(uuidv4(), 10);
      
      await pool.query(
        'INSERT INTO appUser (userID, password, firstName, lastName, email) VALUES ($1, $2, $3, $4, $5)',
        [userId, randomPassword, firstName || 'User', lastName || '', email]
      );

      user = {
        userid: userId,
        email,
        firstname: firstName || 'User',
        lastname: lastName || ''
      };
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT token
    // Note: PostgreSQL returns column names in lowercase unless quoted
    const token = jwt.sign(
      {
        userId: user.userid || user.userID,
        email: user.email,
        firstName: user.firstname || user.firstName,
        lastName: user.lastname || user.lastName
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        userId: user.userid || user.userID,
        email: user.email,
        firstName: user.firstname || user.firstName,
        lastName: user.lastname || user.lastName
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

