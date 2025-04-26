# Deployment Guide

## Frontend Deployment (Vercel)

1. Create a Vercel account if you don't have one at https://vercel.com
2. Install Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Navigate to the frontend directory:
   ```
   cd frontend
   ```
4. Login to Vercel CLI:
   ```
   vercel login
   ```
5. Deploy your project:
   ```
   vercel
   ```
6. For production deployment:
   ```
   vercel --prod
   ```

## Backend Deployment (Railway)

1. Create a Railway account if you don't have one at https://railway.app
2. Install Railway CLI:
   ```
   npm install -g @railway/cli
   ```
3. Login to Railway CLI:
   ```
   railway login
   ```
4. Create a new project:
   ```
   railway init
   ```
5. Navigate to the backend directory:
   ```
   cd backend
   ```
6. Deploy the backend:
   ```
   railway up
   ```

## Environment Variables

### Backend Environment Variables (Railway)

Set these variables in the Railway dashboard:

- `PORT`: Port for the server (Railway will assign its own port)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Set to "production"
- `FRONTEND_URL`: URL of your deployed frontend on Vercel

### Frontend Environment Variables (Vercel)

Set these variables in the Vercel dashboard:

- `VITE_API_URL`: URL of your deployed backend on Railway

## Connecting Frontend to Backend

1. In your frontend code, update the API base URL to point to your Railway-deployed backend.
2. In your Railway backend, ensure CORS is configured to allow requests from your Vercel frontend domain.

## Continuous Deployment

Both Vercel and Railway support continuous deployment from GitHub. Connect your repository to automate deployments on every push.
