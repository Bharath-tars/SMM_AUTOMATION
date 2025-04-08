const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get database connection from parent module
let db;
const setDb = (database) => {
  db = database;
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const result = await db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.lastID, email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.lastID,
        email,
        name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LinkedIn OAuth login
router.post('/linkedin', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }
    
    // Import LinkedIn service
    const linkedinService = require('../services/linkedinService');
    
    // Exchange code for access token
    const tokenResponse = await linkedinService.getAccessToken(code);
    
    // Get user profile from LinkedIn
    const profile = await linkedinService.getUserProfile(tokenResponse.access_token);
    
    // Check if user exists
    let user = await db.get('SELECT * FROM users WHERE email = ?', [profile.email]);
    
    if (!user) {
      // Create new user if not exists
      const result = await db.run(
        'INSERT INTO users (email, password, name, linkedin_token, linkedin_refresh_token, linkedin_expires_at, linkedin_profile_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          profile.email,
          'linkedin_auth', // Placeholder password for LinkedIn users
          `${profile.firstName} ${profile.lastName}`,
          tokenResponse.access_token,
          tokenResponse.refresh_token || null,
          Date.now() + tokenResponse.expires_in * 1000,
          profile.id
        ]
      );
      
      user = {
        id: result.lastID,
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`
      };
    } else {
      // Update existing user with new LinkedIn token
      await db.run(
        'UPDATE users SET linkedin_token = ?, linkedin_refresh_token = ?, linkedin_expires_at = ?, linkedin_profile_id = ? WHERE id = ?',
        [
          tokenResponse.access_token,
          tokenResponse.refresh_token || null,
          Date.now() + tokenResponse.expires_in * 1000,
          profile.id,
          user.id
        ]
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'LinkedIn login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('LinkedIn login error:', error);
    res.status(500).json({ message: 'Failed to authenticate with LinkedIn' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // In a real app, this would use a middleware to verify the JWT token
    // and attach the user to the request object
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await db.get('SELECT id, email, name FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, setDb };