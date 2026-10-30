const https = require('https');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ThirteenCluesBoardGameToolkit/1.0 (educational tool)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function searchWiki(query) {
  const enc = encodeURIComponent(query);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${enc}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size`;
  const res = await getJson(url);
  if (!res.query || !res.query.pages) return [];
  return Object.values(res.query.pages).map(p => ({
    title: p.title,
    url: p.imageinfo && p.imageinfo[0] ? p.imageinfo[0].url : null,
    width: p.imageinfo && p.imageinfo[0] ? p.imageinfo[0].width : 0,
    height: p.imageinfo && p.imageinfo[0] ? p.imageinfo[0].height : 0,
  }));
}

async function run() {
  console.log('Searching Atkinson Grimshaw dock:');
  const docks = await searchWiki('Grimshaw docks night');
  console.log(docks);

  console.log('Searching antique revolver:');
  const revolvers = await searchWiki('antique revolver pistol');
  console.log(revolvers);
}

run().catch(console.error);
