const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create requirement types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requirement_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create requirements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requirements (
        id SERIAL PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        contact VARCHAR(255),
        details TEXT NOT NULL,
        type VARCHAR(255) NOT NULL,
        status VARCHAR(100) DEFAULT 'Pending',
        images TEXT[],
        videos TEXT[],
        comments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_comment_at TIMESTAMP
      )
    `);

    // Insert default requirement types if they don't exist
    const defaultTypes = [
      'Special Order',
      'Bulk Purchase',
      'Custom Item',
      'Rush Delivery',
      'Product Inquiry',
      'Price Quote'
    ];

    for (const typeName of defaultTypes) {
      await pool.query(`
        INSERT INTO requirement_types (name) 
        VALUES ($1) 
        ON CONFLICT (name) DO NOTHING
      `, [typeName]);
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// API Routes

// Get all requirement types
app.get('/api/types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requirement_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// Add new requirement type
app.post('/api/types', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Type name is required' });
    }

    const result = await pool.query(
      'INSERT INTO requirement_types (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'This requirement type already exists' });
    } else {
      console.error('Error adding type:', error);
      res.status(500).json({ error: 'Failed to add type' });
    }
  }
});

// Get all requirements
app.get('/api/requirements', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM requirements ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
});

// Add new requirement
app.post('/api/requirements', async (req, res) => {
  try {
    const {
      customer,
      contact,
      details,
      type,
      status = 'Pending',
      images = [],
      videos = [],
      comments = []
    } = req.body;

    if (!customer || !details || !type) {
      return res.status(400).json({ error: 'Customer, details, and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO requirements 
       (customer, contact, details, type, status, images, videos, comments) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [customer, contact, details, type, status, images, videos, comments]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding requirement:', error);
    res.status(500).json({ error: 'Failed to add requirement' });
  }
});

// Update requirement status
app.patch('/api/requirements/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE requirements SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update requirement
app.put('/api/requirements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer,
      contact,
      details,
      type
    } = req.body;

    if (!customer || !details || !type) {
      return res.status(400).json({ error: 'Customer, details, and type are required' });
    }

    const result = await pool.query(
      `UPDATE requirements 
       SET customer = $1, contact = $2, details = $3, type = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [customer, contact, details, type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating requirement:', error);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

// Delete requirement
app.delete('/api/requirements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM requirements WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json({ message: 'Requirement deleted successfully' });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

// Add comment to requirement
app.post('/api/requirements/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, images = [], videos = [] } = req.body;

    if (!text && images.length === 0 && videos.length === 0) {
      return res.status(400).json({ error: 'Comment text or media is required' });
    }

    // Get current requirement
    const reqResult = await pool.query(
      'SELECT comments FROM requirements WHERE id = $1',
      [id]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    const currentComments = reqResult.rows[0].comments || [];
    const newComment = {
      text: text || '',
      timestamp: new Date().toISOString(),
      images,
      videos
    };

    const updatedComments = [...currentComments, newComment];

    const result = await pool.query(
      `UPDATE requirements 
       SET comments = $1, last_comment_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [updatedComments, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML file for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end();
  process.exit(0);
});
