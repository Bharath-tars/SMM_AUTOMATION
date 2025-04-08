const axios = require('axios');
const { db } = require('../database');

// LinkedIn API endpoints
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2';

// LinkedIn API service
const linkedinService = {
  /**
   * Get the LinkedIn OAuth authorization URL
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl: () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      scope: 'r_liteprofile r_emailaddress w_member_social',
      state: Math.random().toString(36).substring(2, 15),
    });

    return `${LINKEDIN_AUTH_URL}/authorization?${params.toString()}`;
  },

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from LinkedIn
   * @returns {Promise<Object>} Access token response
   */
  getAccessToken: async (code) => {
    try {
      const response = await axios.post(`${LINKEDIN_AUTH_URL}/accessToken`, null, {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      console.error('LinkedIn access token error:', error.response?.data || error.message);
      throw new Error('Failed to get LinkedIn access token');
    }
  },

  /**
   * Get user profile information from LinkedIn
   * @param {string} accessToken - LinkedIn access token
   * @returns {Promise<Object>} User profile data
   */
  getUserProfile: async (accessToken) => {
    try {
      // Get basic profile information
      const profileResponse = await axios.get(`${LINKEDIN_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Get email address
      const emailResponse = await axios.get(`${LINKEDIN_API_URL}/emailAddress?q=members&projection=(elements*(handle~))`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profile = profileResponse.data;
      const email = emailResponse.data.elements[0]['handle~'].emailAddress;

      return {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        email,
      };
    } catch (error) {
      console.error('LinkedIn profile error:', error.response?.data || error.message);
      throw new Error('Failed to get LinkedIn profile');
    }
  },

  /**
   * Create a post on LinkedIn
   * @param {string} accessToken - LinkedIn access token
   * @param {string} content - Post content
   * @returns {Promise<Object>} Post response
   */
  createPost: async (accessToken, content) => {
    try {
      // Get user URN
      const profileResponse = await axios.get(`${LINKEDIN_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userUrn = profileResponse.data.id;

      // Create post
      const postData = {
        author: `urn:li:person:${userUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      const response = await axios.post(`${LINKEDIN_API_URL}/ugcPosts`, postData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return response.data;
    } catch (error) {
      console.error('LinkedIn post error:', error.response?.data || error.message);
      throw new Error('Failed to create LinkedIn post');
    }
  },

  /**
   * Store LinkedIn credentials for a user
   * @param {number} userId - User ID
   * @param {Object} credentials - LinkedIn credentials
   * @returns {Promise<void>}
   */
  storeCredentials: async (userId, credentials) => {
    try {
      await db.run(
        'UPDATE users SET linkedin_token = ?, linkedin_refresh_token = ?, linkedin_expires_at = ? WHERE id = ?',
        [
          credentials.access_token,
          credentials.refresh_token || null,
          Date.now() + credentials.expires_in * 1000,
          userId,
        ]
      );
    } catch (error) {
      console.error('Store LinkedIn credentials error:', error);
      throw new Error('Failed to store LinkedIn credentials');
    }
  },

  /**
   * Get LinkedIn credentials for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} LinkedIn credentials
   */
  getCredentials: async (userId) => {
    try {
      const user = await db.get(
        'SELECT linkedin_token, linkedin_refresh_token, linkedin_expires_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user || !user.linkedin_token) {
        return null;
      }

      return {
        access_token: user.linkedin_token,
        refresh_token: user.linkedin_refresh_token,
        expires_at: user.linkedin_expires_at,
      };
    } catch (error) {
      console.error('Get LinkedIn credentials error:', error);
      throw new Error('Failed to get LinkedIn credentials');
    }
  },

  /**
   * Refresh LinkedIn access token
   * @param {string} refreshToken - LinkedIn refresh token
   * @returns {Promise<Object>} New access token response
   */
  refreshAccessToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${LINKEDIN_AUTH_URL}/accessToken`, null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      console.error('LinkedIn refresh token error:', error.response?.data || error.message);
      throw new Error('Failed to refresh LinkedIn access token');
    }
  },
};

module.exports = linkedinService;