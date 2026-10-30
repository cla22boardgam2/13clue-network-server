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
  const searches = [
    { key: 'rope', q: '"hangman\'s knot" OR "noose"' },
    { key: 'rope', q: '"manila rope" OR "hemp rope"' },
    { key: 'bomb', q: '"grenade" "fuse" museum' },
    { key: 'bomb', q: 'Orsini bomb' }
  ];

  for (const s of searches) {
    const enc = encodeURIComponent(s.q);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|size`;
    const res = await getJson(url);
    if (res.query && res.query.pages) {
      console.log(`Results for ${s.q}:`);
      let i = 0;
      for (const p of Object.values(res.query.pages)) {
        if (p.imageinfo && p.imageinfo[0]) {
          const u = p.imageinfo[0].url;
          if (u.endsWith('.jpg') || u.endsWith('.png')) {
            console.log(`  ${p.title} -> ${u}`);
            const dest = `scratch/candidates/test_${s.key}_${i++}.jpg`;
            try {
              await download(u, dest);
              console.log(`  Saved to ${dest}`);
            } catch (e) {
              console.log(`  Failed download: ${e.message}`);
            }
          }
        }
      }
    }
  }
}

run();
