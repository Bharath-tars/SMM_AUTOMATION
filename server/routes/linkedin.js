const express = require('express');
const router = express.Router();
const linkedinService = require('../services/linkedinService');
const auth = require('../middleware/auth');

// Get LinkedIn authorization URL
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = linkedinService.getAuthorizationUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('LinkedIn auth URL error:', error);
    res.status(500).json({ message: 'Failed to generate LinkedIn authorization URL' });
  }
});

// Get LinkedIn profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get LinkedIn credentials
    const credentials = await linkedinService.getCredentials(userId);
    
    if (!credentials) {
      return res.status(400).json({ message: 'LinkedIn account not connected' });
    }
    
    // Check if token is expired
    if (credentials.expires_at < Date.now()) {
      // Refresh token if available
      if (credentials.refresh_token) {
        const newTokens = await linkedinService.refreshAccessToken(credentials.refresh_token);
        
        // Update credentials in database
        await linkedinService.storeCredentials(userId, newTokens);
        
        // Update access token
        credentials.access_token = newTokens.access_token;
      } else {
        return res.status(401).json({ message: 'LinkedIn token expired, please reconnect your account' });
      }
    }
    
    // Get profile
    const profile = await linkedinService.getUserProfile(credentials.access_token);
    
    res.json({ profile });
  } catch (error) {
    console.error('LinkedIn profile error:', error);
    res.status(500).json({ message: 'Failed to get LinkedIn profile' });
  }
});

// Post to LinkedIn
router.post('/post', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, postId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Get LinkedIn credentials
    const credentials = await linkedinService.getCredentials(userId);
    
    if (!credentials) {
      return res.status(400).json({ message: 'LinkedIn account not connected' });
    }
    
    // Check if token is expired
    if (credentials.expires_at < Date.now()) {
      // Refresh token if available
      if (credentials.refresh_token) {
        const newTokens = await linkedinService.refreshAccessToken(credentials.refresh_token);
        
        // Update credentials in database
        await linkedinService.storeCredentials(userId, newTokens);
        
        // Update access token
        credentials.access_token = newTokens.access_token;
      } else {
        return res.status(401).json({ message: 'LinkedIn token expired, please reconnect your account' });
      }
    }
    
    // Post to LinkedIn
    const postResponse = await linkedinService.createPost(credentials.access_token, content);
    
    // If postId is provided, update the post status in the database
    if (postId) {
      const { db } = require('../database');
      await db.run('UPDATE posts SET status = "published" WHERE id = ? AND user_id = ?', [postId, userId]);
    }
    
    res.json({ 
      message: 'Posted to LinkedIn successfully',
      post: postResponse 
    });
  } catch (error) {
    console.error('LinkedIn post error:', error);
    res.status(500).json({ message: 'Failed to post to LinkedIn' });
  }
});

module.exports = router;