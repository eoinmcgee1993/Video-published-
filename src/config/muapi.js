/**
 * MuAPI Configuration
 * Centralized configuration for MuAPI endpoints and authentication
 */

const config = {
  baseURL: process.env.MUAPI_BASE_URL || 'https://api.muapi.ai',
  apiKey: process.env.MUAPI_API_KEY,
  endpoints: {
    youtubePublish: '/api/v1/youtube-publish',
    socialAccounts: '/api/social/accounts',
    videoStatus: '/api/v1/video-status'
  },
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

module.exports = config;
