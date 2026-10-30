const fs = require('fs');
const path = require('path');

const base64File = 'src/data/cardBase64.ts';
const content = fs.readFileSync(base64File, 'utf8');

const outDir = 'scratch/exported_cards';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Regex to find each card id and base64
const regex = /'([a-z]-[a-z]+)'\s*:\s*'(data:image\/[a-z]+;base64,([^']+))'/g;
let match;
let count = 0;

while ((match = regex.exec(content)) !== null) {
  const cardId = match[1];
  const b64Data = match[3];
  const buf = Buffer.from(b64Data, 'base64');
  fs.writeFileSync(path.join(outDir, `${cardId}.jpg`), buf);
  console.log(`Saved ${cardId}.jpg (${buf.length} bytes)`);
  count++;
}

console.log(`Total exported: ${count}`);
