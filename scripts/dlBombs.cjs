const https = require('https');
const fs = require('fs');

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
  await download(
    'https://upload.wikimedia.org/wikipedia/commons/8/8a/17th_century_hand_grenades_%2826128996163%29.jpg',
    'scratch/candidates/w-bomb_17th_grenades.jpg'
  );
  console.log('Downloaded 17th grenades');

  await download(
    'https://upload.wikimedia.org/wikipedia/commons/b/bc/Orsini_bomb_image_ILN_1858.jpg',
    'scratch/candidates/w-bomb_iln1858.jpg'
  );
  console.log('Downloaded ILN bomb');
}

run();
