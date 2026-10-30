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
  'w-axe': 'axe wood chopping tool antique OR broadaxe',
  'w-wrench': 'monkey wrench tool antique OR vintage pipe wrench',
  'w-club': 'police truncheon wooden OR Victorian truncheon',
  'w-dagger': 'dagger knife steel antique blade MET OR poniard dagger',
  'w-rope': 'coiled hemp rope nautical OR coil of rope ship',
  'w-poison': 'poison bottle apothecary antique glass OR skull poison bottle',
  'w-bomb': 'cannonball spherical bomb fuse OR exploding bomb cannonball',
  'l-market': 'Covent Garden market London painting OR Victorian market scene',
  'l-museum': 'picture gallery museum painting interior OR gallery of the louvre painting',
  'l-cellar': 'wine cellar barrels vaulted ceiling OR wine cellar oak barrels stone',
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
        const dest = path.join(outDir, `${key}_cand${i}${ext}`);
        try {
          const size = await download(imgUrl, dest);
          console.log(`✓ ${key}_cand${i}: ${p.title} (${size} bytes)`);
        } catch (err) {
          console.error(`✗ Error downloading ${key}_cand${i}: ${err.message}`);
        }
      }
    } catch (e) {
      console.error(`Search error for ${key}:`, e.message);
    }
  }
}

run();
