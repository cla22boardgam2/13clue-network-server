const https = require('https');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': '13CluesGameBot/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function test() {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=filetype:bitmap%20flintlock%20pistol&gsrlimit=3&prop=imageinfo&iiprop=url';
  const res = await getJson(url);
  console.log(JSON.stringify(res, null, 2));
}

test().catch(console.error);
