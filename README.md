# Indian Open Mic

A backend service for managing open mic events and performances, built with NestJS.

## Tech Stack

- **Backend Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Cloud Services**: AWS SDK
- **Video Integration**: YouTube API
- **Testing**: Jest
- **Containerization**: Docker

## Project Structure

```
src/
├── auth/           # Authentication related modules
├── config/         # Configuration files
├── database/       # Database configuration and utilities
├── entities/       # TypeORM entities
├── migrations/     # Database migrations
├── posts/          # Post management module
├── scripts/        # Utility scripts
├── types/          # TypeScript type definitions
├── users/          # User management module
├── app.module.ts   # Main application module
├── main.ts         # Application entry point
└── endpoints.ts    # API endpoint definitions
```

## Features

- User authentication and authorization
- Post management system
- YouTube video integration
- AWS cloud services integration
- Database migrations
- RESTful API endpoints
- Type-safe development with TypeScript
- Containerized deployment with Docker

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional)
- AWS credentials (if using AWS services)
- YouTube API credentials (if using YouTube integration)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/indian-open-mic.git
cd indian-open-mic
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=indian_open_mic

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=xyz
AWS_SECRET_ACCESS_KEY=xyz
AWS_REGION=us-east-1
AWS_BUCKET_NAME=indiaopenmic-media-uploads

# Google API Configuration
GOOGLE_API_KEY=xyz
GOOGLE_CLIENT_ID=xyz
GOOGLE_CLIENT_SECRET=xyz
GOOGLE_REFRESH_TOKEN=xyz
GOOGLE_ACCESS_TOKEN=xyz
GOOGLE_TOKEN_TYPE=Bearer
GOOGLE_SCOPE=https://www.googleapis.com/auth/youtube.force-ssl

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# Application Configuration
NODE_ENV=development
PORT=9000
NODE_OPTIONS=--openssl-legacy-provider
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Using Docker
```bash
docker build -t indian-open-mic .
docker run -p 9000:9000 indian-open-mic
```

## Database Migrations

To create a new migration:
```bash
npm run migration:generate -- -n MigrationName
```

To run migrations:
```bash
npm run migration:run
```

## Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

## API Documentation

The API documentation is available at `/api` endpoint when running the application.
