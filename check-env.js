#!/usr/bin/env node

/**
 * Environment Variable Checker for QuadLearning Portal
 * 
 * This script helps diagnose API connection issues by checking:
 * 1. Environment variable settings
 * 2. API URL configuration
 * 3. Frontend-backend connection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 QuadLearning Environment Checker');
console.log('==================================\n');

// Check frontend environment files
const envFiles = [
  { path: path.join(__dirname, 'frontend', '.env'), name: 'Frontend Dev Environment' },
  { path: path.join(__dirname, 'frontend', '.env.local'), name: 'Frontend Local Environment' },
  { path: path.join(__dirname, 'frontend', '.env.production'), name: 'Frontend Production Environment' },
  { path: path.join(__dirname, '.env'), name: 'Backend Environment' },
];

console.log('Checking environment files...');

envFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name} found: ${file.path}`);
    const env = dotenv.parse(fs.readFileSync(file.path));
    
    // Check for API URL
    if (file.path.includes('frontend')) {
      if (env.VITE_API_URL) {
        console.log(`   🔗 API URL: ${env.VITE_API_URL}`);
      } else {
        console.log(`   ❌ VITE_API_URL not found in ${file.name}`);
      }
    }
  } else {
    console.log(`❌ ${file.name} not found: ${file.path}`);
  }
});

// Check Vite config
const viteConfigPath = path.join(__dirname, 'frontend', 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  console.log('\n✅ Vite config found');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (viteConfig.includes('proxy:')) {
    console.log('   ✅ Proxy configuration found in Vite config');
  } else {
    console.log('   ❓ No proxy configuration found in Vite config');
  }
} else {
  console.log('\n❌ Vite config not found');
}

// Check API utility file
const apiUtilPath = path.join(__dirname, 'frontend', 'src', 'utils', 'api.js');
if (fs.existsSync(apiUtilPath)) {
  console.log('\n✅ API utility file found');
  const apiUtil = fs.readFileSync(apiUtilPath, 'utf8');
  
  if (apiUtil.includes('import.meta.env.VITE_API_URL')) {
    console.log('   ✅ VITE_API_URL usage found in API utility');
  } else {
    console.log('   ❓ No VITE_API_URL usage found in API utility');
  }
} else {
  console.log('\n❌ API utility file not found');
}

console.log('\n📋 Recommendations:');
console.log('1. Create a frontend/.env.production file with:');
console.log('   VITE_API_URL=https://your-backend-url.onrender.com');
console.log('2. Make sure your API utility is using the environment variable');
console.log('3. Update your routes to include the full URL path in production');
console.log('\nRun this command to test building the frontend:');
console.log('   cd frontend && npm run build');
console.log('\nThen deploy again to Render.'); 