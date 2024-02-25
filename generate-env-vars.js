const fs = require('fs');
const crypto = require('crypto');

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');
const YOUTUBE_API_KEY = 'AIzaSyDy6O6D7-GEio6lmTwz6cZSNZjotAw2cvs';
const ATHLEANX_CHANNEL_ID = 'UCe0TLA0EsQbE-MjuHXevj2A';

// Write the secret key to the .env file
fs.writeFileSync('.env', `SESSION_SECRET=${secretKey}\nYOUTUBE_API_KEY=${YOUTUBE_API_KEY}\nATHLEANX_CHANNEL_ID=${ATHLEANX_CHANNEL_ID}`);

console.log('Secret key generated and saved to .env file.');