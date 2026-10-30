const https = require('https');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function test() {
  for (const q of ['grenade', 'cannonball', 'noose', 'rope knot']) {
    const search = await getJson(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(q)}&hasImages=true`);
    console.log(`Met search for "${q}":`, search.total);
    if (search.objectIDs && search.objectIDs.length > 0) {
      for (const id of search.objectIDs.slice(0, 3)) {
        const obj = await getJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
        if (obj.primaryImageSmall || obj.primaryImage) {
          console.log(`  [${id}] ${obj.title} -> ${obj.primaryImageSmall || obj.primaryImage}`);
        }
      }
    }
  }
}

test().catch(console.error);
