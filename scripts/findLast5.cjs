const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = 'scratch/candidates';

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ThirteenCluesGame/1.0 (contact@myschool.kr)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ThirteenCluesGame/1.0 (contact@myschool.kr)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode + ' for ' + url));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
    }).on('error', reject);
  });
}

const SEARCHES = {
  'l-museum': 'Morse Gallery of the Louvre OR Picture Gallery Teniers',
  'w-wrench': 'monkey wrench patent OR Coes wrench antique',
  'w-club': 'British police truncheon OR Victorian police baton',
  'w-rope': 'coil of manila rope OR coiled hemp rope deck',
  'w-bomb': 'grenade 18th century fuse OR cannonball bomb fuse',
};

async function run() {
  for (const [key, q] of Object.entries(SEARCHES)) {
    try {
      const enc = encodeURIComponent(q);
      const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|size`;
      const res = await getJson(url);
      if (!res.query || !res.query.pages) {
        console.log(`No results for ${key}`);
        continue;
      }
      const pages = Object.values(res.query.pages).filter(p => p.imageinfo && p.imageinfo[0]);
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const imgUrl = p.imageinfo[0].url;
        const ext = path.extname(imgUrl.split('?')[0]) || '.jpg';
        if (!['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) continue;
        const dest = path.join(outDir, `${key}_last${i}${ext}`);
        try {
          const size = await download(imgUrl, dest);
          console.log(`✓ ${key}_last${i}: ${p.title} (${size} bytes)`);
        } catch (err) {
          console.error(`✗ Error downloading ${key}_last${i}: ${err.message}`);
        }
      }
    } catch (e) {
      console.error(`Search error for ${key}:`, e.message);
    }
  }
}

run();
