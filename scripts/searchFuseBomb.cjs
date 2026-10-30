const https = require('https');
const fs = require('fs');

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

async function run() {
  const enc = encodeURIComponent('"bomb" AND ("fuse" OR "burning fuse") filetype:bitmap');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size`;
  const res = await getJson(url);
  if (res.query && res.query.pages) {
    for (const p of Object.values(res.query.pages)) {
      if (p.imageinfo && p.imageinfo[0]) {
        console.log(`* ${p.title} -> ${p.imageinfo[0].url}`);
      }
    }
  }
}

run();
