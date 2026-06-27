/**
 * Basic Usage Examples
 * Common patterns for using the Video Publisher API
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Example 1: Create and publish a video
async function createAndPublishVideo() {
  try {
    console.log('Creating video...');
    
    // Step 1: Create video
    const createResponse = await axios.post(`${API_BASE}/videos`, {
      title: 'My Generated Video',
      description: 'Created using Video Publisher API',
      mediaUrl: 'https://cdn.muapi.ai/your-video.mp4',
      accountId: 42,
      tags: ['ai', 'muapi', 'demo'],
      privacy: 'public'
    });

    const video = createResponse.data.video;
    console.log('✓ Video created:', video.id);

    // Step 2: Publish video
    console.log('Publishing video...');
    const publishResponse = await axios.post(
      `${API_BASE}/videos/${video.id}/publish`
    );

    console.log('✓ Video published!');
    console.log('Published result:', publishResponse.data.publishResult);

    return video;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 2: List all videos with filtering
async function listVideos() {
  try {
    console.log('Fetching videos...');

    // Get all published videos for account 42
    const response = await axios.get(`${API_BASE}/videos`, {
      params: {
        status: 'published',
        accountId: 42
      }
    });

    console.log(`✓ Found ${response.data.count} published videos:`);
    response.data.videos.forEach(video => {
      console.log(`  - ${video.title} (${video.id})`);
    });

    return response.data.videos;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 3: Get video details and history
async function getVideoDetails(videoId) {
  try {
    console.log(`Fetching video ${videoId}...`);

    const response = await axios.get(`${API_BASE}/videos/${videoId}`);
    const video = response.data;

    console.log('✓ Video details:');
    console.log(`  Title: ${video.title}`);
    console.log(`  Status: ${video.status}`);
    console.log(`  Created: ${video.createdAt}`);
    
    if (video.publishHistory.length > 0) {
      console.log(`  Publishing history: ${video.publishHistory.length} entries`);
      video.publishHistory.forEach((entry, idx) => {
        console.log(`    ${idx + 1}. ${entry.status} at ${entry.timestamp}`);
      });
    }

    return video;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 4: Get publishing statistics
async function getStatistics() {
  try {
    console.log('Fetching statistics...');

    const response = await axios.get(`${API_BASE}/videos/stats/overview`);
    const stats = response.data;

    console.log('✓ Publishing statistics:');
    console.log(`  Total videos: ${stats.total}`);
    console.log(`  Published: ${stats.published}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Pending: ${stats.pending}`);

    return stats;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 5: Get connected social accounts
async function getSocialAccounts() {
  try {
    console.log('Fetching social accounts...');

    const response = await axios.get(`${API_BASE}/accounts`);

    console.log(`✓ Found ${response.data.count} connected accounts:`);
    response.data.accounts.forEach(account => {
      console.log(`  - ${account.name || account.id} (${account.platform})`);
    });

    return response.data.accounts;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 6: Error handling with retry
async function publishWithRetry(videoId, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Publishing attempt ${attempt}/${maxRetries}...`);

      const response = await axios.post(
        `${API_BASE}/videos/${videoId}/publish`
      );

      console.log('✓ Video published successfully!');
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;

      if (attempt < maxRetries && [408, 429, 500, 502, 503].includes(status)) {
        const delay = 1000 * attempt;
        console.log(`⏳ Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

// Example 7: Batch create videos
async function createBatchVideos(videos) {
  const results = [];

  for (const videoData of videos) {
    try {
      console.log(`Creating: ${videoData.title}`);

      const response = await axios.post(`${API_BASE}/videos`, videoData);
      results.push({
        success: true,
        video: response.data.video
      });

      console.log(`✓ Created: ${response.data.video.id}`);
    } catch (error) {
      results.push({
        success: false,
        error: error.response?.data || error.message,
        videoData
      });

      console.error(`❌ Failed: ${error.response?.data?.error}`);
    }
  }

  return results;
}

// Run examples
async function runExamples() {
  console.log('=== Video Publisher API Examples ===\n');

  // Uncomment examples to run:

  // await createAndPublishVideo();
  // await listVideos();
  // await getStatistics();
  // await getSocialAccounts();
  
  // Example: Create multiple videos
  // const videos = [
  //   {
  //     title: 'Video 1',
  //     description: 'First video',
  //     mediaUrl: 'https://cdn.muapi.ai/video1.mp4',
  //     accountId: 42,
  //     tags: ['demo']
  //   },
  //   {
  //     title: 'Video 2',
  //     description: 'Second video',
  //     mediaUrl: 'https://cdn.muapi.ai/video2.mp4',
  //     accountId: 42,
  //     tags: ['demo']
  //   }
  // ];
  // await createBatchVideos(videos);
}

// Export for use in other files
module.exports = {
  createAndPublishVideo,
  listVideos,
  getVideoDetails,
  getStatistics,
  getSocialAccounts,
  publishWithRetry,
  createBatchVideos
};

// Run if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
