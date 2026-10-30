const https = require('https');
const fs = require('fs');
const path = require('path');

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

const searches = [
  { key: 'w-bomb', query: 'grenade fuse "18th century" OR "19th century" cannonball' },
  { key: 'w-bomb', query: 'Orsini bomb OR "cast iron grenade"' },
  { key: 'w-rope', query: 'coiled rope deck OR "coiled rope"' },
  { key: 'w-rope', query: 'hemp rope coil nautical' },
];

async function run() {
  for (const s of searches) {
    console.log(`\nSearching for ${s.key}: ${s.query}...`);
    const enc = encodeURIComponent(s.query);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size`;
    try {
      const res = await getJson(url);
      if (!res.query || !res.query.pages) {
        console.log('No results');
        continue;
      }
      const pages = Object.values(res.query.pages).filter(p => p.imageinfo && p.imageinfo[0]);
      for (const p of pages) {
        const info = p.imageinfo[0];
        console.log(` - Title: ${p.title} (${info.width}x${info.height}, ${info.size} bytes)`);
        console.log(`   URL: ${info.url}`);
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

run();
