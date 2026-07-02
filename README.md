# Video Publisher

A complete video management system with YouTube publishing capabilities via MuAPI.

## Features

- ✅ **Video Management** - Create, store, and track videos
- ✅ **YouTube Publishing** - Publish videos directly to YouTube using MuAPI
- ✅ **Social Account Integration** - Connect and manage multiple social media accounts
- ✅ **Publishing Workflow** - Track video status from creation to publishing
- ✅ **Retry Logic** - Automatic retry handling for failed requests
- ✅ **Statistics** - Monitor publishing metrics and performance
- ✅ **Error Handling** - Comprehensive error handling and logging

## Getting Started

### Prerequisites

- Node.js 14+ 
- npm or yarn
- MuAPI account with API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/eoinmcgee1993/Video-published-.git
cd Video-published-
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Update `.env` with your MuAPI credentials
```
MUAPI_API_KEY=your_api_key_here
MUAPI_BASE_URL=https://api.muapi.ai
PORT=3000
```

5. Start the server
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Video Management

**Create Video**
```http
POST /videos
Content-Type: application/json

{
  "title": "My Video Title",
  "description": "Video description",
  "mediaUrl": "https://cdn.example.com/video.mp4",
  "accountId": 42,
  "tags": ["ai", "tutorial"],
  "privacy": "public"
}
```

**Response:**
```json
{
  "message": "Video created successfully",
  "video": {
    "id": "uuid-here",
    "title": "My Video Title",
    "status": "created",
    "createdAt": "2024-01-01T00:00:00Z",
    "publishHistory": []
  }
}
```

**List Videos**
```http
GET /videos?status=published&accountId=42
```

**Get Video Details**
```http
GET /videos/:videoId
```

**Publish Video to YouTube**
```http
POST /videos/:videoId/publish
```

**Delete Video**
```http
DELETE /videos/:videoId
```

**Get Statistics**
```http
GET /videos/stats/overview
```

Response:
```json
{
  "total": 10,
  "published": 8,
  "failed": 1,
  "pending": 1
}
```

#### Social Accounts

**Get Connected Accounts**
```http
GET /accounts
```

Response:
```json
{
  "count": 2,
  "accounts": [
    {
      "id": 42,
      "platform": "youtube",
      "name": "My Channel"
    }
  ]
}
```

### Video Status Lifecycle

```
created → pending → published
   ↓
  failed
```

## Architecture

### Service Layer (`src/services/`)

**muapiService.js**
- Handles all MuAPI interactions
- Manages retry logic and error recovery
- Publishes videos to YouTube
- Fetches social accounts and video status

**videoStore.js**
- In-memory video management
- Tracks publishing history
- Maintains video metadata
- Provides statistics

### Routes (`src/routes/`)

**videos.js** - Video CRUD operations and publishing
**accounts.js** - Social media account management

### Configuration

**config/muapi.js** - Centralized MuAPI configuration
- Base URL and API key
- Endpoint definitions
- Retry settings

## Error Handling

The application implements comprehensive error handling:

- **Network Errors** - Automatic retry with exponential backoff
- **API Errors** - Status code validation and meaningful error messages
- **Validation Errors** - Request payload validation
- **Logging** - Structured logging for debugging

### Retryable Errors

The following HTTP status codes trigger automatic retries:
- 408 (Request Timeout)
- 429 (Too Many Requests)
- 5xx (Server Errors)

## Logging

Logs are output in JSON format with the following levels:
- `error` - Critical errors
- `warn` - Warning messages
- `info` - Informational messages (default)
- `debug` - Debug information

Control log level via `LOG_LEVEL` environment variable.

## Examples

### Publishing a Video (Complete Flow)

```bash
# 1. Create video
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Generated Video",
    "description": "Made with MuAPI",
    "mediaUrl": "https://cdn.muapi.ai/your-video.mp4",
    "accountId": 42,
    "tags": ["ai", "muapi"],
    "privacy": "public"
  }'

# 2. Publish the video
curl -X POST http://localhost:3000/api/videos/{videoId}/publish

# 3. Check statistics
curl http://localhost:3000/api/videos/stats/overview
```

## Development

### Project Structure

```
Video-published-/
├── src/
│   ├── config/          # Configuration files
│   ├── services/        # Business logic services
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Main application
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
└── README.md            # This file
```

### Running Tests

```bash
npm test
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `MUAPI_API_KEY` | Your MuAPI API key | `sk-xxxx` |
| `MUAPI_BASE_URL` | MuAPI base URL | `https://api.muapi.ai` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |

## API Key Security

⚠️ **Never commit your `.env` file with sensitive data!**

- Keep `.env` in `.gitignore` (already added)
- Use `.env.example` as a template
- Rotate API keys regularly
- Use environment-specific configurations in production

## Performance Considerations

- **In-Memory Storage** - For production, integrate a database (PostgreSQL, MongoDB, etc.)
- **Rate Limiting** - Consider adding rate limiting for API endpoints
- **Caching** - Implement caching for frequently accessed data
- **Async Processing** - Consider using job queues for video publishing

## Support

For issues or questions:
1. Check the troubleshooting section in this README
2. Review application logs
3. Check MuAPI documentation: https://muapi.ai/docs

## License

MIT

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ using Node.js and Express
