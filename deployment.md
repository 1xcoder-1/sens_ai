# Deployment Guide

## Overview

This guide provides instructions for deploying the AI Career Coach application to various hosting platforms. The application is built with Next.js and can be deployed to any platform that supports Node.js applications.

## Prerequisites

Before deploying, ensure you have:

1. A production-ready database (PostgreSQL recommended)
2. All required environment variables configured
3. Domain name (optional but recommended)
4. SSL certificate (recommended)

## Environment Variables

Ensure all environment variables from [.env.example](../.env.example) are set in your production environment:

- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Clerk sign-in URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Clerk sign-up URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Post sign-in redirect URL
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Post sign-up redirect URL
- `GEMINI_API_KEY` - Google Gemini API key
- `INNGEST_SIGNING_KEY` - Inngest signing key (optional)
- `INNGEST_EVENT_KEY` - Inngest event key (optional)
- `NEXT_PUBLIC_APP_URL` - Your application's URL

## Recent Enhancements

The application has been enhanced with several new features:

1. **Improved Quiz Functionality**:
   - Quizzes now generate 10 questions instead of 5
   - Added delete functionality for user assessments
   - Enhanced quiz results display with better text visibility

2. **Enhanced Cover Letter Generation**:
   - Fixed database error related to additionalInfo field
   - Added real-time progress animation during AI generation
   - Improved UI with better spacing and layout

3. **Better UI/UX**:
   - Conditional footer now properly hides on 404 pages
   - Improved text color contrast for better readability
   - Added gap between content and footer on cover letter page

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

### Steps:

1. Push your code to a GitHub repository
2. Sign up for a Vercel account at [vercel.com](https://vercel.com)
3. Create a new project and import your GitHub repository
4. Configure environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required environment variables
5. Deploy the project

### Vercel Configuration

The application includes a `vercel.json` configuration file with optimized settings:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "includeFiles": ["next.config.js"]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

## Docker Deployment

The application includes a Dockerfile for containerized deployment.

### Building the Image

```bash
docker build -t ai-career-coach .
```

### Running the Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key \
  -e CLERK_SECRET_KEY=your_clerk_secret \
  ai-career-coach
```

### Docker Compose

For easier deployment with dependencies, use the provided `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/ai_career_coach
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
      - CLERK_SECRET_KEY=your_clerk_secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_career_coach
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## Manual Deployment

For manual deployment to a server:

### 1. Server Setup

Ensure your server has:
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Reverse proxy (nginx recommended)

### 2. Application Deployment

```bash
# Clone the repository
git clone https://github.com/your-username/ai-career-coach.git
cd ai-career-coach

# Install dependencies
npm install

# Build the application
npm run build

# Set environment variables
export DATABASE_URL=your_database_url
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
# ... set all other required environment variables

# Start the application
npm start
```

### 3. Process Management

Use a process manager like PM2 to keep the application running:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "ai-career-coach" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## Nginx Configuration

For production deployments, use nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Verification

After deployment, verify that all features are working correctly:

1. **User Authentication**:
   - Test sign up and sign in functionality
   - Verify redirects work correctly

2. **Core Features**:
   - Test resume creation and improvement
   - Generate a cover letter and verify it saves correctly
   - Create and complete an interview quiz
   - Delete a quiz to verify the delete functionality

3. **UI/UX**:
   - Check that the footer is hidden on 404 pages
   - Verify proper spacing between content and footer
   - Confirm real-time progress animations work during AI generation

4. **Database**:
   - Ensure all database operations work correctly
   - Verify no errors related to missing fields or incorrect data types

## Monitoring and Maintenance

1. **Regular Updates**:
   - Keep dependencies updated
   - Apply security patches promptly

2. **Performance Monitoring**:
   - Monitor response times
   - Track database query performance
   - Watch for memory leaks

3. **Backup Strategy**:
   - Implement regular database backups
   - Test backup restoration procedures
   - Store backups in secure, geographically distributed locations

4. **Error Tracking**:
   - Set up error logging and monitoring
   - Configure alerts for critical issues
   - Regularly review error logs for patterns