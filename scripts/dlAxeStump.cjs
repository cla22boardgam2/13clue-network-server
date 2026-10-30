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
  const q = 'axe log stump wood';
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=8`;
  const res = await getJson(url);
  if (!res.query || !res.query.search) return;

  const titles = res.query.search.map(s => s.title).join('|');
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url`;
  const iRes = await getJson(infoUrl);

  let i = 0;
  for (const page of Object.values(iRes.query.pages)) {
    if (page.imageinfo && page.imageinfo[0]) {
      const u = page.imageinfo[0].url;
      if (u.endsWith('.jpg') || u.endsWith('.png')) {
        const dest = `scratch/candidates/axe_stump_${i++}.jpg`;
        await download(u, dest);
        console.log(`Saved ${dest} from ${page.title}`);
      }
    }
  }
}

run();
