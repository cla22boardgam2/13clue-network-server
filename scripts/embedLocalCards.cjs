const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Copy rotated test weapons to final_cards if they exist
const copies = [
  ['scratch/candidates/test_rifle_rot.jpg', 'scratch/final_cards/w-rifle.jpg'],
  ['scratch/candidates/test_pistol_rot.jpg', 'scratch/final_cards/w-pistol.jpg'],
  ['scratch/candidates/test_wrench_rot.jpg', 'scratch/final_cards/w-wrench.jpg'],
  ['scratch/candidates/test_rope_crop.jpg', 'scratch/final_cards/w-rope.jpg'],
];

for (const [src, dst] of copies) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${src} -> ${dst}`);
  }
}

const cardIds = [
  'l-dock',
  'l-alley',
  'l-park',
  'l-market',
  'l-cemetery',
  'l-ballroom',
  'l-greenhouse',
  'l-cellar',
  'l-museum',
  'w-pistol',
  'w-rifle',
  'w-dagger',
  'w-poison',
  'w-axe',
  'w-wrench',
  'w-club',
  'w-rope',
  'w-bomb'
];

const targetFile = 'src/data/cardBase64.ts';
let content = fs.readFileSync(targetFile, 'utf8');

for (const id of cardIds) {
  const imgPath = path.join('scratch', 'final_cards', `${id}.jpg`);
  if (!fs.existsSync(imgPath)) {
    console.error(`Missing image: ${imgPath}`);
    continue;
  }
  const buf = fs.readFileSync(imgPath);
  const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');
  
  // Replace in cardBase64.ts
  const regex = new RegExp(`'${id}'\\s*:\\s*'data:image\\/jpeg;base64,[^']+'`);
  if (regex.test(content)) {
    content = content.replace(regex, `'${id}': '${b64}'`);
    console.log(`✓ Updated ${id} (${buf.length} bytes)`);
  } else {
    console.warn(`! ID not matched with regex in file: ${id}`);
  }
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully written to src/data/cardBase64.ts!');

// 2. Build the project
console.log('Running buildSingle.cjs...');
execSync('node scripts/buildSingle.cjs', { stdio: 'inherit' });
console.log('Build completed successfully!');
