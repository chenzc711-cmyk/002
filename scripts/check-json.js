const fs = require('fs');
const path = require('path');

const roots = ['app.json', 'project.config.json', 'sitemap.json'];
for (const file of roots) {
  JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
}
console.log('JSON configuration files are valid.');
