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
  const enc = encodeURIComponent('"axe" log OR stump OR "wood chopper"');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size`;
  const res = await getJson(url);
  if (res.query && res.query.pages) {
    let i = 0;
    for (const p of Object.values(res.query.pages)) {
      if (p.imageinfo && p.imageinfo[0]) {
        const u = p.imageinfo[0].url;
        if (u.endsWith('.jpg') || u.endsWith('.png')) {
          console.log(`Axe cand ${i}: ${p.title} -> ${u}`);
          const dest = `scratch/candidates/w-axe_new${i++}.jpg`;
          try {
            await download(u, dest);
            console.log(`Saved ${dest}`);
          } catch (e) {
            console.log(`Failed ${dest}: ${e.message}`);
          }
        }
      }
    }
  }
}

run();
