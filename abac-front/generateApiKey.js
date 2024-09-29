import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const generateApiKey = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    apiKey += characters[randomIndex];
  }
  return apiKey;
};

const apiKey = generateApiKey(32);

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFilePath = path.join(__dirname, '.env');

fs.writeFileSync(envFilePath, `VITE_API_KEY=${apiKey}\n`, { flag: 'a' });

console.log(`API Key generated and saved to ${envFilePath}`);