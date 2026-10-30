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
  const search = await getJson('https://collectionapi.metmuseum.org/public/collection/v1/search?q=dagger&hasImages=true');
  console.log('Met dagger results:', search.total, 'Object IDs:', search.objectIDs ? search.objectIDs.slice(0, 3) : []);
  if (search.objectIDs && search.objectIDs.length > 0) {
    const obj = await getJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${search.objectIDs[0]}`);
    console.log('Title:', obj.title);
    console.log('Primary image:', obj.primaryImageSmall || obj.primaryImage);
  }
}

test().catch(console.error);
