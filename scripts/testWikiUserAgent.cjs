const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'ThirteenCluesEducationalToolkit/1.0 (contact@elementaryschool.kr; https://github.com/13clues)'
      }
    };
    https.get(url, opts, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
    }).on('error', reject);
  });
}

download('https://upload.wikimedia.org/wikipedia/commons/b/b3/Grimshaw_John_Atkinson_Humber_Docks_Hull.jpg', 'scratch/dock_test.jpg')
  .then(size => console.log('DOWNLOADED SUCCESS! Dock size:', size))
  .catch(err => console.error('FAILED:', err.message));
