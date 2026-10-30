const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

console.log('Index.html size (MB):', (content.length / 1024 / 1024).toFixed(2));
console.log('Contains cemetery base64:', content.includes('data:image/jpeg;base64,'));
console.log('Contains secret confirmation button:', content.includes('확인 완료 및 턴 종료'));
console.log('Contains viewed secret banner:', content.includes('내가 확인한 단서:'));
console.log('Does NOT contain old flip-wrap bug:', !content.includes('className="flip-wrap"'));
