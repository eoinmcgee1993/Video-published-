/**
 * Express Server
 * Main application entry point
 */

require('dotenv').config();

const express = require('express');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const videoRoutes = require('./routes/videos');
const accountRoutes = require('./routes/accounts');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/videos', videoRoutes);
app.use('/api/accounts', accountRoutes);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Video Publisher API',
    version: '1.0.0',
    endpoints: {
      videos: {
        'POST /api/videos': 'Create a new video',
        'GET /api/videos': 'List all videos',
        'GET /api/videos/:videoId': 'Get video details',
        'POST /api/videos/:videoId/publish': 'Publish video to YouTube',
        'DELETE /api/videos/:videoId': 'Delete a video',
        'GET /api/videos/stats/overview': 'Get publishing statistics'
      },
      accounts: {
        'GET /api/accounts': 'Get connected social media accounts'
      },
      health: {
        'GET /health': 'Health check'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
