const express = require('express');
const router = express.Router();

// Get database connection from parent module
let db;
const setDb = (database) => {
  db = database;
};

// Middleware to verify JWT token (simplified version)
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Attach user to request
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Get all posts for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const posts = await db.all('SELECT * FROM posts WHERE user_id = ? ORDER BY scheduled_date DESC', [req.user.id]);
    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single post
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const post = await db.get('SELECT * FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { 
      title, 
      content, 
      scheduled_date, 
      status = 'draft', 
      ai_optimized = false,
      is_evergreen = false,
      recycle_frequency = null
    } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Insert post
    const result = await db.run(
      `INSERT INTO posts (
        user_id, title, content, scheduled_date, status, 
        ai_optimized, is_evergreen, recycle_frequency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, title, content, scheduled_date, status, 
        ai_optimized ? 1 : 0, is_evergreen ? 1 : 0, recycle_frequency
      ]
    );
    
    // Get the created post
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [result.lastID]);
    
    res.status(201).json({ 
      message: 'Post created successfully', 
      post 
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { 
      title, 
      content, 
      scheduled_date, 
      status, 
      ai_optimized,
      engagement,
      is_evergreen,
      recycle_frequency,
      last_recycled
    } = req.body;
    
    // Check if post exists and belongs to user
    const existingPost = await db.get(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?', 
      [req.params.id, req.user.id]
    );
    
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Update post
    await db.run(
      `UPDATE posts SET 
        title = COALESCE(?, title), 
        content = COALESCE(?, content), 
        scheduled_date = COALESCE(?, scheduled_date), 
        status = COALESCE(?, status), 
        ai_optimized = COALESCE(?, ai_optimized),
        engagement = COALESCE(?, engagement),
        is_evergreen = COALESCE(?, is_evergreen),
        recycle_frequency = COALESCE(?, recycle_frequency),
        last_recycled = COALESCE(?, last_recycled)
      WHERE id = ? AND user_id = ?`,
      [
        title, content, scheduled_date, status, 
        ai_optimized !== undefined ? (ai_optimized ? 1 : 0) : null,
        engagement,
        is_evergreen !== undefined ? (is_evergreen ? 1 : 0) : null,
        recycle_frequency,
        last_recycled,
        req.params.id, req.user.id
      ]
    );
    
    // Get updated post
    const updatedPost = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    
    res.json({ 
      message: 'Post updated successfully', 
      post: updatedPost 
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Check if post exists and belongs to user
    const existingPost = await db.get(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?', 
      [req.params.id, req.user.id]
    );
    
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Delete post
    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Optimization endpoint (mock implementation)
router.post('/:id/optimize', authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post exists and belongs to user
    const post = await db.get(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?', 
      [postId, req.user.id]
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // In a real app, this would call an AI service to optimize the content
    // For now, we'll just add some mock optimization
    const optimizedContent = `${post.content} [AI Optimized for better engagement]`;
    
    // Update post with optimized content
    await db.run(
      'UPDATE posts SET content = ?, ai_optimized = 1 WHERE id = ?',
      [optimizedContent, postId]
    );
    
    // Get updated post
    const updatedPost = await db.get('SELECT * FROM posts WHERE id = ?', [postId]);
    
    res.json({ 
      message: 'Post optimized successfully', 
      post: updatedPost 
    });
  } catch (error) {
    console.error('Optimize post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule post for optimal time using AI algorithm
router.post('/:id/schedule-optimal', authenticateUser, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post exists and belongs to user
    const post = await db.get(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?', 
      [postId, req.user.id]
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Import scheduler service
    const { determineOptimalPostingTime } = require('../services/schedulerService');
    
    // Determine optimal posting time based on user's engagement patterns
    const optimalDate = await determineOptimalPostingTime(req.user.id);
    
    // Update post with optimal schedule
    await db.run(
      'UPDATE posts SET scheduled_date = ?, status = "scheduled" WHERE id = ?',
      [optimalDate.toISOString(), postId]
    );
    
    // Get updated post
    const updatedPost = await db.get('SELECT * FROM posts WHERE id = ?', [postId]);
    
    res.json({ 
      message: 'Post scheduled for optimal time based on engagement analysis', 
      post: updatedPost 
    });
  } catch (error) {
    console.error('Schedule optimal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recycle evergreen content (mock implementation)
router.post('/recycle-evergreen', authenticateUser, async (req, res) => {
  try {
    // Get all evergreen posts for the user
    const evergreenPosts = await db.all(
      'SELECT * FROM posts WHERE user_id = ? AND is_evergreen = 1 AND status = "published"', 
      [req.user.id]
    );
    
    const recycledPosts = [];
    const now = new Date();
    
    // Check each post for recycling eligibility
    for (const post of evergreenPosts) {
      let shouldRecycle = false;
      const lastRecycled = post.last_recycled ? new Date(post.last_recycled) : null;
      
      // Determine if post should be recycled based on frequency
      if (!lastRecycled) {
        shouldRecycle = true;
      } else {
        switch (post.recycle_frequency) {
          case 'weekly':
            // Recycle if it's been at least 7 days
            shouldRecycle = (now - lastRecycled) >= 7 * 24 * 60 * 60 * 1000;
            break;
          case 'biweekly':
            // Recycle if it's been at least 14 days
            shouldRecycle = (now - lastRecycled) >= 14 * 24 * 60 * 60 * 1000;
            break;
          case 'monthly':
            // Recycle if it's been at least 30 days
            shouldRecycle = (now - lastRecycled) >= 30 * 24 * 60 * 60 * 1000;
            break;
          default:
            shouldRecycle = false;
        }
      }
      
      if (shouldRecycle) {
        // Create a new scheduled post based on the evergreen content
        // In a real app, you might want to slightly modify the content each time
        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + 3); // Schedule for 3 days from now
        scheduledDate.setHours(10, 0, 0, 0); // At 10:00 AM
        
        const result = await db.run(
          `INSERT INTO posts (
            user_id, title, content, scheduled_date, status, 
            ai_optimized, is_evergreen, recycle_frequency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id, 
            `${post.title} (Recycled)`, 
            post.content, 
            scheduledDate.toISOString(), 
            'scheduled', 
            post.ai_optimized, 
            1, // is_evergreen
            post.recycle_frequency
          ]
        );
        
        // Update the original post's last_recycled date
        await db.run(
          'UPDATE posts SET last_recycled = ? WHERE id = ?',
          [now.toISOString(), post.id]
        );
        
        // Get the newly created post
        const newPost = await db.get('SELECT * FROM posts WHERE id = ?', [result.lastID]);
        recycledPosts.push(newPost);
      }
    }
    
    res.json({ 
      message: `${recycledPosts.length} evergreen posts recycled`, 
      recycledPosts 
    });
  } catch (error) {
    console.error('Recycle evergreen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, setDb };