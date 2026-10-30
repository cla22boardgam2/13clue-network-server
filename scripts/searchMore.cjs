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

const queries = [
  'hand grenade 18th century OR 17th century grenade',
  'Orsini bomb ILN',
  'powder keg wooden barrel',
  'hangman noose rope wood',
  'thick hemp rope coil'
];

async function run() {
  for (const q of queries) {
    const enc = encodeURIComponent(q);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|size`;
    const res = await getJson(url);
    if (res.query && res.query.pages) {
      console.log(`=== Query: ${q} ===`);
      for (const p of Object.values(res.query.pages)) {
        if (p.imageinfo && p.imageinfo[0]) {
          const info = p.imageinfo[0];
          console.log(`* ${p.title} -> ${info.url}`);
        }
      }
    }
  }
}

run();
