const https = require('https');

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

async function test() {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=axe&srnamespace=6&srlimit=5';
  const res = await getJson(url);
  console.log('Results:', res.query ? res.query.search : 'No query');
}

test();
