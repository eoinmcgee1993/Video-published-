/**
 * Video Store Service
 * Manages video metadata and publishing history
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory store (can be replaced with database)
let videos = {};

class VideoStore {
  /**
   * Create a new video record
   * @param {Object} videoData - Video metadata
   * @returns {Object} Created video record
   */
  createVideo(videoData) {
    const videoId = uuidv4();
    const video = {
      id: videoId,
      ...videoData,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishHistory: []
    };

    videos[videoId] = video;
    logger.info(`Video created: ${videoId}`);
    return video;
  }

  /**
   * Get video by ID
   * @param {string} videoId - The video ID
   * @returns {Object|null} Video record or null
   */
  getVideo(videoId) {
    return videos[videoId] || null;
  }

  /**
   * Update video status
   * @param {string} videoId - The video ID
   * @param {string} status - New status
   * @param {Object} publishResult - Publishing result details
   * @returns {Object} Updated video record
   */
  updateVideoStatus(videoId, status, publishResult = null) {
    if (!videos[videoId]) {
      throw new Error(`Video not found: ${videoId}`);
    }

    const video = videos[videoId];
    video.status = status;
    video.updatedAt = new Date();

    if (publishResult) {
      video.publishHistory.push({
        timestamp: new Date(),
        status,
        result: publishResult
      });
      video.lastPublished = publishResult;
    }

    logger.info(`Video status updated: ${videoId} -> ${status}`);
    return video;
  }

  /**
   * List all videos
   * @param {Object} filters - Filter options
   * @returns {Array} List of videos
   */
  listVideos(filters = {}) {
    let result = Object.values(videos);

    if (filters.status) {
      result = result.filter(v => v.status === filters.status);
    }

    if (filters.accountId) {
      result = result.filter(v => v.accountId === filters.accountId);
    }

    return result;
  }

  /**
   * Delete a video record
   * @param {string} videoId - The video ID
   * @returns {boolean} Success status
   */
  deleteVideo(videoId) {
    if (videos[videoId]) {
      delete videos[videoId];
      logger.info(`Video deleted: ${videoId}`);
      return true;
    }
    return false;
  }

  /**
   * Get publishing statistics
   * @returns {Object} Stats about published videos
   */
  getStats() {
    const allVideos = Object.values(videos);
    return {
      total: allVideos.length,
      published: allVideos.filter(v => v.status === 'published').length,
      failed: allVideos.filter(v => v.status === 'failed').length,
      pending: allVideos.filter(v => v.status === 'pending').length
    };
  }
}

module.exports = new VideoStore();
