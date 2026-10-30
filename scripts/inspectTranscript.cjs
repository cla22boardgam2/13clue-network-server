const fs = require('fs');
const transcriptPath = 'C:/Users/user/.gemini/antigravity-ide/brain/f20ddf06-fb65-49a6-af11-7b05c3ee3b92/.system_generated/logs/transcript.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (line.includes('generate_image') && line.includes('sample_crossbow')) {
    try {
      const obj = JSON.parse(line);
      console.log(JSON.stringify(obj, null, 2));
    } catch (e) {
      console.log('Match found but parse failed');
    }
  }
}
