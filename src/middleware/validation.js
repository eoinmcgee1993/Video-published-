/**
 * Validation Middleware
 * Request validation utilities
 */

const validateVideoPublish = (req, res, next) => {
  const { title, description, mediaUrl, accountId, tags, privacy } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  if (!mediaUrl || typeof mediaUrl !== 'string' || !isValidUrl(mediaUrl)) {
    errors.push('mediaUrl is required and must be a valid URL');
  }

  if (!accountId || typeof accountId !== 'number') {
    errors.push('accountId is required and must be a number');
  }

  if (description && typeof description !== 'string') {
    errors.push('description must be a string');
  }

  if (tags && !Array.isArray(tags)) {
    errors.push('tags must be an array');
  }

  if (privacy && !['public', 'private', 'unlisted'].includes(privacy)) {
    errors.push('privacy must be one of: public, private, unlisted');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  validateVideoPublish,
  isValidUrl
};
