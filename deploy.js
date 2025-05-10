#!/usr/bin/env node

/**
 * QuadLearning Deployment Helper Script
 * 
 * This script helps verify your project is ready for deployment
 */

import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 QuadLearning Deployment Helper');
console.log('================================\n');

// Check for required files
const requiredFiles = [
  { path: path.join(__dirname, 'backend', 'server.js'), name: 'Backend server' },
  { path: path.join(__dirname, 'frontend', 'index.html'), name: 'Frontend entry' },
  { path: path.join(__dirname, 'frontend', 'vite.config.js'), name: 'Vite config' },
];

console.log('Checking required files...');
let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name} found`);
  } else {
    console.log(`❌ ${file.name} missing`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check your project structure.');
  process.exit(1);
}

// Check for .env files
console.log('\nChecking environment files...');
const envBackend = path.join(__dirname, 'backend', '.env');
const envFrontend = path.join(__dirname, 'frontend', '.env.production');
  
if (fs.existsSync(envBackend)) {
  console.log('✅ Backend .env exists');
} else {
  console.log('⚠️ Backend .env missing - create from example');
}

if (fs.existsSync(envFrontend)) {
  console.log('✅ Frontend .env.production exists');
} else {
  console.log('⚠️ Frontend .env.production missing - create from example');
}

// Build frontend
console.log('\nAttempting frontend build...');
exec('cd frontend && npm run build', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Frontend build failed');
    console.log(stderr);
    return;
  }
  
  console.log('✅ Frontend build succeeded');
  const distPath = path.join(__dirname, 'frontend', 'dist');
  
  if (fs.existsSync(distPath)) {
    console.log(`✅ Build directory exists at ${distPath}`);
  }
  
  console.log('\n✅ Project is ready for deployment to Render!');
  console.log('Follow the instructions in README.md to deploy.');
}); 