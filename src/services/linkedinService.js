// Mock LinkedIn service with static data
const linkedinService = {
  /**
   * Check if user has connected LinkedIn account
   * @returns {Promise<boolean>} True if connected
   */
  isConnected: async () => {
    // Always return true for demo purposes
    return true;
  },

  /**
   * Get LinkedIn profile information
   * @returns {Promise<Object>} LinkedIn profile
   */
  getProfile: async () => {
    // Return mock profile data
    return {
      id: 'demo-profile-id',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      headline: 'Software Developer',
      profilePicture: 'https://via.placeholder.com/150'
    };
  },

  /**
   * Post content to LinkedIn
   * @param {string} content - Post content
   * @param {number} postId - Post ID (optional)
   * @returns {Promise<Object>} Post response
   */
  createPost: async (content, postId = null) => {
    // Simulate successful post creation
    return {
      id: `post-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      status: 'published'
    };
  },
};

export default linkedinService;