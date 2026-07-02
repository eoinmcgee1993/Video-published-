/**
 * Social Accounts Routes
 * API endpoints for managing social media accounts
 */

const express = require('express');
const router = express.Router();
const muapiService = require('../services/muapiService');
const logger = require('../utils/logger');

/**
 * GET /api/accounts
 * Get all connected social media accounts
 */
router.get('/', async (req, res) => {
  try {
    const accounts = await muapiService.getSocialAccounts();

    res.json({
      count: accounts.length,
      accounts
    });
  } catch (error) {
    logger.error('Failed to fetch social accounts', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
