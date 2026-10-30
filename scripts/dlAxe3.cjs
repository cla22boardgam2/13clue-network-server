const https = require('https');

https.get('https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=broadaxe&srnamespace=6&srlimit=5', {
  headers: { 'User-Agent': 'ThirteenCluesGame/1.0 (contact@myschool.kr)' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(data.substring(0, 500)));
});
