/**
 * MuAPI Service
 * Handles all interactions with the MuAPI platform
 */

const axios = require('axios');
const config = require('../config/muapi');
const logger = require('../utils/logger');

class MuAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    });
  }

  /**
   * Publish a video to YouTube
   * @param {Object} videoData - Video metadata and publishing options
   * @returns {Promise<Object>} Publishing response with video ID
   */
  async publishToYouTube(videoData) {
    const {
      accountId,
      mediaUrl,
      title,
      description,
      tags = [],
      privacy = 'public'
    } = videoData;

    try {
      logger.info(`Publishing video: ${title}`);

      const payload = {
        account_id: accountId,
        media_url: mediaUrl,
        title,
        description,
        tags,
        privacy
      };

      const response = await this.retryRequest(() =>
        this.client.post(config.endpoints.youtubePublish, payload)
      );

      logger.info(`Video published successfully. ID: ${response.data.video_id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to publish video to YouTube', {
        error: error.message,
        videoTitle: title,
        status: error.response?.status
      });
      throw new Error(`YouTube publishing failed: ${error.message}`);
    }
  }

  /**
   * Get social media accounts
   * @returns {Promise<Array>} List of social media accounts
   */
  async getSocialAccounts() {
    try {
      logger.info('Fetching social media accounts');

      const response = await this.retryRequest(() =>
        this.client.get(config.endpoints.socialAccounts)
      );

      logger.info(`Retrieved ${response.data.accounts.length} social accounts`);
      return response.data.accounts;
    } catch (error) {
      logger.error('Failed to fetch social accounts', {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`Failed to fetch social accounts: ${error.message}`);
    }
  }

  /**
   * Get video publishing status
   * @param {string} videoId - The video ID to check
   * @returns {Promise<Object>} Video status information
   */
  async getVideoStatus(videoId) {
    try {
      logger.info(`Checking status for video: ${videoId}`);

      const response = await this.retryRequest(() =>
        this.client.get(`${config.endpoints.videoStatus}/${videoId}`)
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get video status', {
        error: error.message,
        videoId,
        status: error.response?.status
      });
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }

  /**
   * Retry logic for API requests
   * @param {Function} requestFn - Function that makes the API request
   * @returns {Promise<Object>} API response
   */
  async retryRequest(requestFn) {
    let lastError;

    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt < config.retryAttempts && this.isRetryable(error)) {
          const delay = config.retryDelay * attempt;
          logger.warn(`Retry attempt ${attempt}/${config.retryAttempts} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} Whether the request should be retried
   */
  isRetryable(error) {
    if (!error.response) return true; // Network errors are retryable
    
    const status = error.response.status;
    return status === 408 || status === 429 || (status >= 500 && status < 600);
  }
}

module.exports = new MuAPIService();
