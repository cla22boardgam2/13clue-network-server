const https = require('https');
const fs = require('fs');

// We can query Unsplash public endpoint or use direct high-quality Unsplash photo IDs for vintage noir Victorian themes:
const PHOTO_MAP = {
  // 장소 9장
  'l-cemetery': 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=400&h=600&q=80', // spooky dark misty graveyard with crosses
  'l-dock': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&h=600&q=80', // dark harbor dock with mist and water
  'l-park': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=400&h=600&q=80', // dark autumn park with lantern path
  'l-market': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&h=600&q=80', // London street market cobblestone
  'l-alley': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&h=600&q=80', // dark cobblestone alleyway with street lamp
  'l-museum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=400&h=600&q=80', // grand classical museum gallery hall
  'l-ballroom': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&h=600&q=80', // opulent grand ballroom chandelier
  'l-greenhouse': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&h=600&q=80', // vintage botanical glass greenhouse
  'l-cellar': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&h=600&q=80', // dark stone cellar with vintage barrels / stone arch

  // 흉기 9장
  'w-poison': 'https://images.unsplash.com/photo-1512290900672-1f55b9359a60?auto=format&fit=crop&w=400&h=600&q=80', // vintage apothecary amber medicine vial
  'w-bomb': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&h=600&q=80', // explosive sparks fire noir
  'w-rifle': 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&h=600&q=80', // antique vintage hunting rifle
  'w-pistol': 'https://images.unsplash.com/photo-1584282676052-16986287c7bb?auto=format&fit=crop&w=400&h=600&q=80', // antique revolver pistol on wood
  'w-dagger': 'https://images.unsplash.com/photo-1590845947670-c009801ffa74?auto=format&fit=crop&w=400&h=600&q=80', // ornate antique dagger / blade
  'w-rope': 'https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&w=400&h=600&q=80', // heavy nautical / hemp coiled rope
  'w-wrench': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&h=600&q=80', // heavy industrial vintage wrench tool
  'w-club': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&h=600&q=80', // heavy wooden antique gavel / club
  'w-axe': 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=400&h=600&q=80', // rugged forged iron axe in wood
};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode + ' for ' + url));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing 18 photo URLs...');
  for (const [id, url] of Object.entries(PHOTO_MAP)) {
    try {
      const buf = await fetchBuffer(url);
      console.log(`✓ ${id}: ${buf.length} bytes`);
    } catch (e) {
      console.error(`✗ ${id}: ${e.message}`);
    }
  }
}

run();
