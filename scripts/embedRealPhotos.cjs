const https = require('https');
const fs = require('fs');

const PHOTO_MAP = {
  // 장소 9장
  'l-cemetery': 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=400&h=600&q=80',
  'l-dock': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&h=600&q=80',
  'l-park': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=400&h=600&q=80',
  'l-market': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&h=600&q=80',
  'l-alley': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&h=600&q=80',
  'l-museum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=400&h=600&q=80',
  'l-ballroom': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&h=600&q=80',
  'l-greenhouse': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&h=600&q=80',
  'l-cellar': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&h=600&q=80',

  // 흉기 9장
  'w-poison': 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&h=600&q=80',
  'w-bomb': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&h=600&q=80',
  'w-rifle': 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&h=600&q=80',
  'w-pistol': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&h=600&q=80',
  'w-dagger': 'https://images.unsplash.com/photo-1590845947670-c009801ffa74?auto=format&fit=crop&w=400&h=600&q=80',
  'w-rope': 'https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&w=400&h=600&q=80',
  'w-wrench': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&h=600&q=80',
  'w-club': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&h=600&q=80',
  'w-axe': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&h=600&q=80',
};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode + ' for ' + url));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading 18 photos and converting to Base64...');
  const base64Map = {};

  for (const [id, url] of Object.entries(PHOTO_MAP)) {
    try {
      const buf = await fetchBuffer(url);
      const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');
      base64Map[id] = b64;
      console.log(`✓ Converted ${id}: ${buf.length} bytes -> ${b64.length} chars`);
    } catch (e) {
      console.error(`✗ Error downloading ${id}:`, e.message);
      process.exit(1);
    }
  }

  // Now read existing cardBase64.ts
  const filePath = 'src/data/cardBase64.ts';
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace each of the 18 cards
  for (const [id, b64] of Object.entries(base64Map)) {
    const regex = new RegExp(`'${id}'\\s*:\\s*'data:image\\/jpeg;base64,[^']+'`);
    if (regex.test(content)) {
      content = content.replace(regex, `'${id}': '${b64}'`);
      console.log(`Replaced in file: ${id}`);
    } else {
      console.error(`ID not found in file: ${id}`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated src/data/cardBase64.ts with ALL real photos!');
}

run();
