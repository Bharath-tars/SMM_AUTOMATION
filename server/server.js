const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import database module
const { initDatabase } = require('./database');

// Database setup
async function setupDatabase() {
  // Initialize database connection
  const db = await initDatabase();

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      linkedin_token TEXT,
      linkedin_refresh_token TEXT,
      linkedin_expires_at INTEGER,
      linkedin_profile_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create posts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      scheduled_date TIMESTAMP,
      status TEXT DEFAULT 'draft',
      ai_optimized BOOLEAN DEFAULT 0,
      engagement TEXT,
      is_evergreen BOOLEAN DEFAULT 0,
      recycle_frequency TEXT,
      last_recycled TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('Database setup complete');
  return db;
}

// Start server
async function startServer() {
  try {
    // Setup database
    await setupDatabase();
    
    // Import route modules
    const { router: authRouter, setDb: setAuthDb } = require('./routes/auth');
    const { router: postsRouter, setDb: setPostsDb } = require('./routes/posts');
    const linkedinRouter = require('./routes/linkedin');
    
    // Get database instance
    const { db } = require('./database');
    
    // Pass database connection to route modules
    setAuthDb(db);
    setPostsDb(db);
    
    // Initialize scheduler service
    const { initScheduler } = require('./services/schedulerService');
    initScheduler();
    
    // Routes
    app.get('/', (req, res) => {
      res.send('LinkedIn SMM API is running');
    });
    
    // Import LinkedIn callback route
    const linkedinCallbackRouter = require('./routes/linkedinCallback');
    
    // Use route modules
    app.use('/api/auth', authRouter);
    app.use('/api/posts', postsRouter);
    app.use('/api/linkedin', linkedinRouter);
    app.use('/auth/linkedin', linkedinCallbackRouter);
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();