# REST API Deployment Guide

## Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (for database hosting)
- Git

## Environment Setup

1. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?appName=Cluster0
PORT=8080
NODE_ENV=production
JWT_SECRET=your_strong_secret_key_here
```

## Local Development

```bash
# Install dependencies
npm install

# Run with nodemon (watches for changes)
npm run dev
```

## Production Deployment

### Option 1: Heroku

1. Create a Heroku account at https://www.heroku.com
2. Install Heroku CLI
3. Login to Heroku:
```bash
heroku login
```

4. Create a new Heroku app:
```bash
heroku create your-app-name
```

5. Set environment variables:
```bash
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_strong_secret"
heroku config:set NODE_ENV="production"
```

6. Deploy:
```bash
git push heroku main
```

### Option 2: DigitalOcean App Platform

1. Push your code to GitHub
2. Connect your GitHub repository to DigitalOcean
3. Set environment variables in the dashboard
4. Deploy using the App Platform

### Option 3: AWS Elastic Beanstalk

1. Install EB CLI
2. Initialize EB:
```bash
eb init
```

3. Create and deploy:
```bash
eb create
eb deploy
```

### Option 4: Self-hosted (VPS)

1. SSH into your server
2. Install Node.js, npm, and MongoDB (or use MongoDB Atlas)
3. Clone your repository
4. Install dependencies: `npm install`
5. Set up a process manager (PM2):
```bash
npm install -g pm2
pm2 start app.js --name "rest-api"
pm2 startup
pm2 save
```

6. Configure a reverse proxy (Nginx) to forward requests to your Node.js app
7. Set up SSL with Let's Encrypt

## Important Security Checks

✅ Environment variables for sensitive data (database URI, JWT secret)
✅ Error handling and logging
✅ CORS headers configured
✅ Input validation with express-validator
✅ Password hashing with bcryptjs
✅ .gitignore prevents credential leaks

## Pre-deployment Checklist

- [ ] All environment variables properly configured
- [ ] MongoDB connection tested
- [ ] Tests passing (`npm test`)
- [ ] No hardcoded secrets in code
- [ ] Error messages don't expose sensitive information
- [ ] Proper logging for debugging
- [ ] CORS headers appropriate for your domain
- [ ] File uploads secured (images directory)
- [ ] Rate limiting considered (for production)
- [ ] Database backups configured

## Monitoring

For production environments, consider adding:
- Error tracking (Sentry)
- Performance monitoring (DataDog, New Relic)
- Uptime monitoring (StatusPage)
- Log aggregation (ELK Stack, Loggly)

## Support

For questions about specific deployment platforms, refer to their official documentation.
