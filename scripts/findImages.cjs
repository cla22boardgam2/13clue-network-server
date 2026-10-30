const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = 'scratch/candidates';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
  'l-alley': 'Grimshaw Blackman Street OR Grimshaw moonlight lane OR Grimshaw wet road',
  'l-park': 'Grimshaw Roundhay Park OR Grimshaw park moonlight OR Grimshaw autumn golden',
  'l-market': 'Covent Garden market 19th century painting OR Victorian market painting',
  'l-cemetery': 'Caspar David Friedrich graveyard OR Abbey in the Oakwood OR cemetery moonlight painting',
  'l-museum': 'Victorian museum gallery painting interior OR British Museum reading room 19th century',
  'l-ballroom': 'Tissot The Ball OR Victorian ballroom dance painting',
  'l-greenhouse': 'Kew Gardens Palm House interior OR Crystal Palace interior painting 1851',
  'l-cellar': 'wine cellar barrels vaulted ceiling painting OR vaulted stone crypt cellar',
  'w-pistol': 'Model 1860 Colt Army Revolver OR flintlock pistol 18th century MET',
  'w-rifle': 'Pattern 1853 Enfield OR flintlock rifle antique',
  'w-dagger': 'antique dagger with sheath MET OR Renaissance dagger ornate',
  'w-axe': 'broadaxe antique OR wood chopping axe vintage forged',
  'w-wrench': 'monkey wrench Coes antique patent',
  'w-club': 'police truncheon Victorian wooden',
  'w-rope': 'coiled rope hemp nautical rustic',
  'w-poison': 'poison bottle antique skull OR apothecary poison bottle cobalt',
  'w-bomb': 'cannonball bomb fuse OR round grenade 19th century',
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
        const dest = path.join(outDir, `${key}_${i}${ext}`);
        try {
          const size = await download(imgUrl, dest);
          console.log(`✓ ${key}_${i}: ${p.title} (${size} bytes)`);
        } catch (err) {
          console.error(`✗ Error downloading ${key}_${i}: ${err.message}`);
        }
      }
    } catch (e) {
      console.error(`Search error for ${key}:`, e.message);
    }
  }
}

run();
