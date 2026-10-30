const https = require('https');

const candidates = {
  'w-poison': [
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1508759071157-5268048cb13e?auto=format&fit=crop&w=400&h=600&q=80',
  ],
  'w-pistol': [
    'https://images.unsplash.com/photo-1584282676052-16986287c7bb?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&h=600&q=80',
  ],
  'w-axe': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&h=600&q=80',
    'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=400&h=600&q=80',
  ],
};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function test() {
  for (const [key, urls] of Object.entries(candidates)) {
    for (const url of urls) {
      try {
        const buf = await fetchBuffer(url);
        console.log(`FOUND ${key}: ${url} (${buf.length} bytes)`);
        break;
      } catch (e) {
        console.log(`Fail ${key}: ${url}`);
      }
    }
  }
}

test();
