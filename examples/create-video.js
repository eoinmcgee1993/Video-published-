/**
 * examples/create-video.js
 *
 * Simple script to create and publish a video using the Video Publisher API.
 * Supports optional API key / bearer token authentication via environment variables.
 *
 * Usage (Unix/macOS):
 *   API_BASE=http://localhost:3000/api \
 *   MEDIA_URL=https://cdn.muapi.ai/your-video.mp4 \
 *   ACCOUNT_ID=42 \
 *   TITLE="My Generated Video" \
 *   DESCRIPTION="Created with script" \
 *   TAGS="ai,muapi,demo" \
 *   PRIVACY=public \
 *   API_KEY=your_token_here \
 *   node examples/create-video.js
 *
 * Notes:
 * - If your API expects an API key in a header other than Authorization, set API_KEY_HEADER.
 *   Example: API_KEY_HEADER="x-api-key"
 * - If your API expects a different prefix than "Bearer", set API_KEY_PREFIX (e.g. "Token").
 */

const axios = require('axios');

const API_BASE = (process.env.API_BASE || 'http://localhost:3000/api').replace(/\/+$/, '');
const MEDIA_URL = process.env.MEDIA_URL;
const ACCOUNT_ID = Number(process.env.ACCOUNT_ID || 0);
const TITLE = process.env.TITLE || 'My Generated Video';
const DESCRIPTION = process.env.DESCRIPTION || 'Created using Video Publisher API';
const TAGS = (process.env.TAGS || 'demo').split(',').map(t => t.trim()).filter(Boolean);
const PRIVACY = process.env.PRIVACY || 'public';

// Auth support
const API_KEY = process.env.API_KEY || process.env.AUTH_TOKEN || '';
const API_KEY_HEADER = process.env.API_KEY_HEADER || 'Authorization';
const API_KEY_PREFIX = process.env.API_KEY_PREFIX || 'Bearer';

if (!MEDIA_URL) {
  console.error('ERROR: MEDIA_URL environment variable is required.');
  process.exit(1);
}

if (!ACCOUNT_ID) {
  console.error('ERROR: ACCOUNT_ID environment variable is required and must be a number.');
  process.exit(1);
}

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (API_KEY) {
    // If header is the Authorization header and prefix already appears in API_KEY, avoid double prefix
    if ((API_KEY_HEADER.toLowerCase() === 'authorization') && API_KEY.toLowerCase().startsWith(API_KEY_PREFIX.toLowerCase())) {
      headers[API_KEY_HEADER] = API_KEY;
    } else {
      headers[API_KEY_HEADER] = `${API_KEY_PREFIX} ${API_KEY}`;
    }
  }

  return headers;
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: buildHeaders(),
  timeout: 30_000
});

async function createVideo() {
  const payload = {
    title: TITLE,
    description: DESCRIPTION,
    mediaUrl: MEDIA_URL,
    accountId: ACCOUNT_ID,
    tags: TAGS,
    privacy: PRIVACY
  };

  const res = await axiosInstance.post('/videos', payload);
  // Support a couple of common response shapes
  const data = res.data || {};
  const video = data.video || data || {};
  return video;
}

async function publishVideo(videoId) {
  const res = await axiosInstance.post(`/videos/${encodeURIComponent(videoId)}/publish`);
  return res.data;
}

async function publishWithRetry(videoId, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Publishing attempt ${attempt}/${maxRetries}...`);
      const result = await publishVideo(videoId);
      return result;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;

      if (attempt < maxRetries && [408, 429, 500, 502, 503].includes(status)) {
        const delay = 1000 * attempt; // linear backoff: 1s, 2s, 3s
        console.log(`Transient error (status=${status}). Retrying after ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        // Non-retriable or out of retries
        throw err;
      }
    }
  }

  throw lastError;
}

async function run() {
  try {
    console.log('API_BASE:', API_BASE);
    console.log('Creating video...');

    const video = await createVideo();
    const videoId = video.id || video._id || video.videoId || video.id_str;

    if (!videoId) {
      console.error('ERROR: Could not determine created video ID. Response from /videos:', video);
      process.exit(1);
    }

    console.log('✓ Video created:', videoId);

    console.log('Publishing video...');
    // Use retry logic for transient failures
    const publishResult = await publishWithRetry(videoId, 3);

    console.log('✓ Video published!');
    console.log('Publish result:', JSON.stringify(publishResult, null, 2));

    // Optionally fetch video details after publishing
    try {
      const detailsRes = await axiosInstance.get(`/videos/${encodeURIComponent(videoId)}`);
      console.log('Video details:', JSON.stringify(detailsRes.data, null, 2));
    } catch (err) {
      console.warn('Warning: failed to fetch video details after publish:', err.response?.data || err.message);
    }

    return { video, publishResult };
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message || err);
    process.exit(1);
  }
}

module.exports = { run, createVideo, publishVideo, publishWithRetry };

if (require.main === module) {
  run().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}
