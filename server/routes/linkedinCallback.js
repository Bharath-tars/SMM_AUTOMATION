const express = require('express');
const router = express.Router();
const linkedinService = require('../services/linkedinService');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

/**
 * LinkedIn OAuth callback route
 * This route handles the callback from LinkedIn OAuth process
 */
router.get('/callback', async (req, res) => {
  try {
    // Get authorization code from query parameters
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code is required');
    }
    
    // Exchange code for access token
    const tokenResponse = await linkedinService.getAccessToken(code);
    
    // Get user profile from LinkedIn
    const profile = await linkedinService.getUserProfile(tokenResponse.access_token);
    
    // Check if user exists in database
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
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/linkedin/callback?token=${token}`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.status(500).send('Failed to authenticate with LinkedIn');
  }
});

module.exports = router;