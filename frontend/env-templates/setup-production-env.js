#!/usr/bin/env node

/**
 * Setup Production Environment for QuadLearning Portal
 * 
 * This script creates the .env.production file with the correct backend URL
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Template for the .env.production file
const envTemplate = `# Production environment variables

# API URL - point to your deployed backend URL on Render
VITE_API_URL=https://tropical-village-portal.onrender.com

# Encryption key for password encryption (use the same key as in backend)
VITE_ENCRYPTION_KEY=your-encryption-key-here
`;

console.log('🚀 QuadLearning Production Environment Setup');
console.log('===========================================\n');

// Path to the .env.production file
const envPath = path.join(__dirname, '..', '.env.production');

// Check if the file already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️ .env.production file already exists.');
  rl.question('Do you want to overwrite it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log('\n❌ Setup cancelled.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  rl.question('\nEnter the backend URL (default: https://tropical-village-portal.onrender.com): ', (backendUrl) => {
    const url = backendUrl || 'https://tropical-village-portal.onrender.com';
    
    rl.question('Enter your encryption key (or press Enter to use the default placeholder): ', (encryptionKey) => {
      const key = encryptionKey || 'your-encryption-key-here';
      
      // Create the .env.production file
      const envContent = envTemplate
        .replace('https://tropical-village-portal.onrender.com', url)
        .replace('your-encryption-key-here', key);
      
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ .env.production file created successfully!');
      console.log(`📁 File location: ${envPath}`);
      console.log('\n📋 Next steps:');
      console.log('1. Build your frontend with: npm run build');
      console.log('2. Deploy to Render');
      rl.close();
    });
  });
} 