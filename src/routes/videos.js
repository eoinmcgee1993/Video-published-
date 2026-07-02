/**
 * Video Routes
 * API endpoints for video management and publishing
 */

const express = require('express');
const router = express.Router();
const muapiService = require('../services/muapiService');
const videoStore = require('../services/videoStore');
const logger = require('../utils/logger');

/**
 * POST /api/videos
 * Create a new video record
 */
router.post('/', (req, res) => {
  try {
    const { title, description, mediaUrl, accountId, tags, privacy } = req.body;

    // Validation
    if (!title || !mediaUrl || !accountId) {
      return res.status(400).json({
        error: 'Missing required fields: title, mediaUrl, accountId'
      });
    }

    const video = videoStore.createVideo({
      title,
      description,
      mediaUrl,
      accountId,
      tags: tags || [],
      privacy: privacy || 'public'
    });

    res.status(201).json({
      message: 'Video created successfully',
      video
    });
  } catch (error) {
    logger.error('Failed to create video', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/videos
 * List all videos with optional filtering
 */
router.get('/', (req, res) => {
  try {
    const { status, accountId } = req.query;
    const videos = videoStore.listVideos({ status, accountId });

    res.json({
      count: videos.length,
      videos
    });
  } catch (error) {
    logger.error('Failed to list videos', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/videos/:videoId
 * Get a specific video record
 */
router.get('/:videoId', (req, res) => {
  try {
    const video = videoStore.getVideo(req.params.videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    logger.error('Failed to get video', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/videos/:videoId/publish
 * Publish a video to YouTube
 */
router.post('/:videoId/publish', async (req, res) => {
  try {
    const video = videoStore.getVideo(req.params.videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.status === 'published') {
      return res.status(400).json({ error: 'Video already published' });
    }

    // Update status to pending
    videoStore.updateVideoStatus(req.params.videoId, 'pending');

    // Publish to YouTube
    const publishResult = await muapiService.publishToYouTube({
      accountId: video.accountId,
      mediaUrl: video.mediaUrl,
      title: video.title,
      description: video.description,
      tags: video.tags,
      privacy: video.privacy
    });

    // Update status to published
    const updatedVideo = videoStore.updateVideoStatus(
      req.params.videoId,
      'published',
      publishResult
    );

    res.json({
      message: 'Video published successfully',
      video: updatedVideo,
      publishResult
    });
  } catch (error) {
    logger.error('Failed to publish video', { error: error.message });
    
    videoStore.updateVideoStatus(req.params.videoId, 'failed', {
      error: error.message
    });

    res.status(500).json({
      error: error.message,
      message: 'Video publishing failed'
    });
  }
});

/**
 * DELETE /api/videos/:videoId
 * Delete a video record
 */
router.delete('/:videoId', (req, res) => {
  try {
    const deleted = videoStore.deleteVideo(req.params.videoId);

    if (!deleted) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete video', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/videos/stats/overview
 * Get publishing statistics
 */
router.get('/stats/overview', (req, res) => {
  try {
    const stats = videoStore.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get stats', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
