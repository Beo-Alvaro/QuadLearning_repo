# QuadLearning School Management System

A MERN stack application for school management.

## Deployment Guide for Render

### 1. Backend Deployment

1. **Create a Web Service:**

   - Go to Render Dashboard and click "New Web Service"
   - Connect your GitHub repository
   - Select the repository and branch to deploy

2. **Configure Backend Service:**

   - **Name:** `your-backend-name`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/server.js`
   - **Root Directory:** `/` (leave blank)

3. **Set Environment Variables:**

   - NODE_ENV: `production`
   - MONGO_URI: `your-mongodb-connection-string`
   - JWT_SECRET: `your-jwt-secret`
   - VITE_ENCRYPTION_KEY: `your-encryption-key`
   - FRONTEND_URL: `https://your-frontend-name.onrender.com` (your frontend Render URL)

4. **Deploy the service**

### 2. Frontend Deployment

1. **Create a Static Site:**

   - Go to Render Dashboard and click "New Static Site"
   - Connect your GitHub repository
   - Select the repository and branch to deploy

2. **Configure Frontend Service:**

   - **Name:** `your-frontend-name`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Root Directory:** `/` (leave blank)

3. **Set Environment Variables:**

   - VITE_API_URL: `https://your-backend-name.onrender.com`
   - VITE_ENCRYPTION_KEY: `your-encryption-key` (same as backend)

4. **Deploy the service**

### 3. Verify Configuration

1. Make sure both services are deployed successfully
2. Check that your frontend can connect to your backend API
3. Test login functionality and API connections

### Important Notes

- **Order of Deployment**: Deploy the backend first, then the frontend
- **Environment Variables**: After deploying the frontend, update the backend's FRONTEND_URL to point to your deployed frontend URL
- **Redeployment**: After updating environment variables, redeploy both services

### Troubleshooting

- **"Publish directory does not exist" error:** Make sure the publish directory is set correctly to `frontend/dist`
- **Missing images:** All images should be placed in `frontend/public/img/` folder
- **API connection issues:** Ensure the VITE_API_URL points to your backend service
- **CORS errors:** The backend should be configured to accept requests from your frontend domain

### Local Development

1. Clone the repository
2. Create `.env` file in the root directory (see `backend/env.example`)
3. Create `.env.local` file in the `frontend` directory (see `frontend/env.production.example`)
4. Install dependencies: `npm install` and `cd frontend && npm install`
5. Run development server: `npm run dev`
