const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { validateEmail } = require('../middleware/validation');
const { OAuth2Client } = require('google-auth-library');

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

    // Process any pending invitations
    await processPendingInvitations(email, userId);

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

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
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
      process.env.JWT_SECRET,
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
    const { credential } = req.body; // Receive the Google ID token

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify Google token on the backend
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const { email, given_name: firstName, family_name: lastName, sub: googleId } = payload;

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

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server configuration error' });
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
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Process any pending invitations
    await processPendingInvitations(email, userId);

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

// Helper function to process pending invitations
async function processPendingInvitations(email, userId) {
  try {
    // Find pending invitations for this email
    const invitations = await pool.query(
      "SELECT * FROM ProjectInvitation WHERE email = $1 AND status = 'Pending'",
      [email]
    );

    if (invitations.rows.length > 0) {
      console.log(`Found ${invitations.rows.length} pending invitations for ${email}`);

      for (const invite of invitations.rows) {
        // Add to project members
        await pool.query(
          'INSERT INTO ProjectMember (projectId, userId, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [invite.projectid, userId, 'Member']
        );

        // Update invitation status
        await pool.query(
          "UPDATE ProjectInvitation SET status = 'Accepted' WHERE invitationId = $1",
          [invite.invitationid]
        );

        console.log(`Processed invitation ${invite.invitationid} for project ${invite.projectid}`);
      }
    }
  } catch (err) {
    console.error('Error processing pending invitations:', err);
    // Don't block login/registration if this fails, just log it
  }
}

module.exports = router;

