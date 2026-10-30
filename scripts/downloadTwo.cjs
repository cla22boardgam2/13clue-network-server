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

async function run() {
  // Download rope
  await download(
    'https://upload.wikimedia.org/wikipedia/commons/0/0c/Rope_coil_on_deck_%28Unsplash%29.jpg',
    'scratch/candidates/w-rope_cand0.jpg'
  );
  console.log('Downloaded rope_cand0');

  await download(
    'https://upload.wikimedia.org/wikipedia/commons/c/c0/Saga_Oseberg_Details_Rope_coil_Taukveil_Timber_deck_Skipsdekk_Stern_aft_Akterstavn_Sun_backlight_Motlys_Viking_ship_replica_2012_T%C3%B8nsberg_harbour_havn_Kaldnes_bro_footbridge_Norway_2019-08-29_05665.jpg',
    'scratch/candidates/w-rope_cand1.jpg'
  );
  console.log('Downloaded rope_cand1');

  // Download MUHBA Orsini bomb
  await download(
    'https://upload.wikimedia.org/wikipedia/commons/f/f6/MUHBA_Orsini_bomb.jpg',
    'scratch/candidates/w-bomb_orsini.jpg'
  );
  console.log('Downloaded bomb_orsini');

  // Search for dynamite / fuse bomb
  const enc = encodeURIComponent('"sticks of dynamite" OR "dynamite" fuse vintage');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size`;
  const res = await getJson(url);
  if (res.query && res.query.pages) {
    for (const p of Object.values(res.query.pages)) {
      if (p.imageinfo && p.imageinfo[0]) {
        console.log(`Dynamite cand: ${p.title} -> ${p.imageinfo[0].url}`);
      }
    }
  }
}

run();
