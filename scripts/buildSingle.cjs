const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- 1. Restoring index.html from index.source.html ---');
fs.copyFileSync('index.source.html', 'index.html');

console.log('--- 2. Building single-file bundle via Vite ---');
execSync('npx vite build', { stdio: 'inherit' });

console.log('--- 3. Moving dist/index.html to root index.html ---');
fs.copyFileSync(path.join('dist', 'index.html'), 'index.html');

console.log('--- 4. Cleaning up dist folder ---');
fs.rmSync('dist', { recursive: true, force: true });

console.log('✓ SUCCESS: Standalone single-file index.html is ready in root folder!');
