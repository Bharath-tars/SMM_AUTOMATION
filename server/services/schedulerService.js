const cron = require('node-cron');
const { db } = require('../database');
const linkedinService = require('./linkedinService');

/**
 * Initialize the scheduler service
 */
function initScheduler() {
  console.log('Initializing scheduler service...');
  
  // Schedule job to run every 15 minutes to check for posts to publish
  cron.schedule('*/15 * * * *', async () => {
    try {
      await checkScheduledPosts();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });
  
  // Schedule job to run daily at midnight to recycle evergreen content
  cron.schedule('0 0 * * *', async () => {
    try {
      await recycleEvergreenContent();
    } catch (error) {
      console.error('Evergreen recycling error:', error);
    }
  });
  
  // Schedule job to run weekly to analyze engagement patterns
  cron.schedule('0 0 * * 0', async () => {
    try {
      await analyzeEngagementPatterns();
    } catch (error) {
      console.error('Engagement analysis error:', error);
    }
  });
  
  console.log('Scheduler service initialized');
}

/**
 * Check for scheduled posts that need to be published
 */
async function checkScheduledPosts() {
  console.log('Checking for scheduled posts...');
  
  // Get current time
  const now = new Date().toISOString();
  
  // Get scheduled posts that are due
  const posts = await db.all(
    `SELECT p.*, u.linkedin_token, u.linkedin_refresh_token, u.linkedin_expires_at 
     FROM posts p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.status = 'scheduled' AND p.scheduled_date <= ? 
     ORDER BY p.scheduled_date ASC`,
    [now]
  );
  
  console.log(`Found ${posts.length} posts to publish`);
  
  // Publish each post
  for (const post of posts) {
    try {
      // Check if user has LinkedIn token
      if (!post.linkedin_token) {
        console.log(`User ${post.user_id} has no LinkedIn token, skipping post ${post.id}`);
        continue;
      }
      
      // Check if token is expired
      const expiresAt = post.linkedin_expires_at;
      if (expiresAt < Date.now()) {
        // Try to refresh token
        if (post.linkedin_refresh_token) {
          try {
            const newTokens = await linkedinService.refreshAccessToken(post.linkedin_refresh_token);
            
            // Update user's tokens
            await db.run(
              'UPDATE users SET linkedin_token = ?, linkedin_refresh_token = ?, linkedin_expires_at = ? WHERE id = ?',
              [
                newTokens.access_token,
                newTokens.refresh_token || null,
                Date.now() + newTokens.expires_in * 1000,
                post.user_id
              ]
            );
            
            // Update post's token
            post.linkedin_token = newTokens.access_token;
          } catch (refreshError) {
            console.error(`Failed to refresh token for user ${post.user_id}:`, refreshError);
            continue;
          }
        } else {
          console.log(`Token expired for user ${post.user_id} and no refresh token available`);
          continue;
        }
      }
      
      // Post to LinkedIn
      await linkedinService.createPost(post.linkedin_token, post.content);
      
      // Update post status
      await db.run(
        'UPDATE posts SET status = "published" WHERE id = ?',
        [post.id]
      );
      
      console.log(`Published post ${post.id} to LinkedIn`);
    } catch (error) {
      console.error(`Failed to publish post ${post.id}:`, error);
    }
  }
}

/**
 * Recycle evergreen content
 */
async function recycleEvergreenContent() {
  console.log('Recycling evergreen content...');
  
  // Get all evergreen posts for recycling
  const evergreenPosts = await db.all(
    `SELECT * FROM posts 
     WHERE is_evergreen = 1 
     AND status = 'published' 
     AND (
       last_recycled IS NULL OR 
       (recycle_frequency = 'weekly' AND last_recycled <= datetime('now', '-7 days')) OR 
       (recycle_frequency = 'biweekly' AND last_recycled <= datetime('now', '-14 days')) OR 
       (recycle_frequency = 'monthly' AND last_recycled <= datetime('now', '-30 days'))
     )`
  );
  
  console.log(`Found ${evergreenPosts.length} evergreen posts to recycle`);
  
  // Process each post
  for (const post of evergreenPosts) {
    try {
      // Determine optimal posting time based on engagement data
      const optimalTime = await determineOptimalPostingTime(post.user_id);
      
      // Create a new scheduled post
      await db.run(
        `INSERT INTO posts (
          user_id, title, content, scheduled_date, status, 
          ai_optimized, is_evergreen, recycle_frequency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          post.user_id, 
          `${post.title} (Recycled)`, 
          post.content, 
          optimalTime.toISOString(), 
          'scheduled', 
          post.ai_optimized, 
          1, // is_evergreen
          post.recycle_frequency
        ]
      );
      
      // Update the original post's last_recycled date
      await db.run(
        'UPDATE posts SET last_recycled = datetime("now") WHERE id = ?',
        [post.id]
      );
      
      console.log(`Recycled post ${post.id}`);
    } catch (error) {
      console.error(`Failed to recycle post ${post.id}:`, error);
    }
  }
}

/**
 * Analyze engagement patterns to determine optimal posting times
 */
async function analyzeEngagementPatterns() {
  console.log('Analyzing engagement patterns...');
  
  // Get all users
  const users = await db.all('SELECT id FROM users');
  
  // Analyze patterns for each user
  for (const user of users) {
    try {
      // Get published posts with engagement data
      const posts = await db.all(
        'SELECT * FROM posts WHERE user_id = ? AND status = "published" AND engagement IS NOT NULL',
        [user.id]
      );
      
      if (posts.length === 0) {
        continue;
      }
      
      // Calculate engagement by day and hour
      const engagementByDayAndHour = {};
      
      for (const post of posts) {
        if (!post.scheduled_date || !post.engagement) {
          continue;
        }
        
        const date = new Date(post.scheduled_date);
        const day = date.getDay(); // 0-6 (Sunday-Saturday)
        const hour = date.getHours(); // 0-23
        
        const key = `${day}-${hour}`;
        
        if (!engagementByDayAndHour[key]) {
          engagementByDayAndHour[key] = {
            count: 0,
            totalEngagement: 0,
            averageEngagement: 0
          };
        }
        
        engagementByDayAndHour[key].count++;
        engagementByDayAndHour[key].totalEngagement += parseInt(post.engagement, 10) || 0;
        engagementByDayAndHour[key].averageEngagement = 
          engagementByDayAndHour[key].totalEngagement / engagementByDayAndHour[key].count;
      }
      
      // Find optimal posting times
      const optimalTimes = Object.entries(engagementByDayAndHour)
        .sort((a, b) => b[1].averageEngagement - a[1].averageEngagement)
        .slice(0, 5) // Top 5 times
        .map(([key, value]) => {
          const [day, hour] = key.split('-').map(Number);
          return { day, hour, averageEngagement: value.averageEngagement };
        });
      
      // Store optimal times for user
      const optimalTimesJson = JSON.stringify(optimalTimes);
      
      // Check if user already has optimal times stored
      const existingOptimalTimes = await db.get(
        'SELECT id FROM user_optimal_times WHERE user_id = ?',
        [user.id]
      );
      
      if (existingOptimalTimes) {
        // Update existing record
        await db.run(
          'UPDATE user_optimal_times SET optimal_times = ?, updated_at = datetime("now") WHERE user_id = ?',
          [optimalTimesJson, user.id]
        );
      } else {
        // Create table if it doesn't exist
        await db.exec(`
          CREATE TABLE IF NOT EXISTS user_optimal_times (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            optimal_times TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);
        
        // Insert new record
        await db.run(
          'INSERT INTO user_optimal_times (user_id, optimal_times) VALUES (?, ?)',
          [user.id, optimalTimesJson]
        );
      }
      
      console.log(`Analyzed engagement patterns for user ${user.id}`);
    } catch (error) {
      console.error(`Failed to analyze engagement patterns for user ${user.id}:`, error);
    }
  }
}

/**
 * Determine optimal posting time for a user
 * @param {number} userId - User ID
 * @returns {Date} Optimal posting time
 */
async function determineOptimalPostingTime(userId) {
  try {
    // Get user's optimal times
    const optimalTimesRecord = await db.get(
      'SELECT optimal_times FROM user_optimal_times WHERE user_id = ?',
      [userId]
    );
    
    if (optimalTimesRecord && optimalTimesRecord.optimal_times) {
      const optimalTimes = JSON.parse(optimalTimesRecord.optimal_times);
      
      if (optimalTimes.length > 0) {
        // Get current date
        const now = new Date();
        
        // Find the next optimal time
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        
        // Try to find an optimal time that's in the future
        for (const { day, hour } of optimalTimes) {
          const daysToAdd = (day - currentDay + 7) % 7;
          
          // If same day, check if hour is in the future
          if (daysToAdd === 0 && hour <= currentHour) {
            continue;
          }
          
          // Create date for this optimal time
          const optimalDate = new Date(now);
          optimalDate.setDate(now.getDate() + daysToAdd);
          optimalDate.setHours(hour, 0, 0, 0);
          
          return optimalDate;
        }
        
        // If no optimal time found in the future, use the first one next week
        const { day, hour } = optimalTimes[0];
        const daysToAdd = (day - currentDay + 7) % 7 || 7; // Ensure at least 1 day in the future
        
        const optimalDate = new Date(now);
        optimalDate.setDate(now.getDate() + daysToAdd);
        optimalDate.setHours(hour, 0, 0, 0);
        
        return optimalDate;
      }
    }
    
    // Fallback to default scheduling (next business day at 10:00 AM)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1); // Next day
    defaultDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    // If it's weekend, move to Monday
    const dayOfWeek = defaultDate.getDay();
    if (dayOfWeek === 0) { // Sunday
      defaultDate.setDate(defaultDate.getDate() + 1);
    } else if (dayOfWeek === 6) { // Saturday
      defaultDate.setDate(defaultDate.getDate() + 2);
    }
    
    return defaultDate;
  } catch (error) {
    console.error(`Failed to determine optimal posting time for user ${userId}:`, error);
    
    // Fallback to default scheduling
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1); // Next day
    defaultDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    return defaultDate;
  }
}

module.exports = {
  initScheduler,
  checkScheduledPosts,
  recycleEvergreenContent,
  analyzeEngagementPatterns,
  determineOptimalPostingTime
};