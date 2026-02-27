const marked = require('marked');
const fs = require('fs');

const path = 'json_data/projects.json';
const data = fs.readFileSync(path, 'utf8');
const projects = JSON.parse(data);

const target = projects.find(p => p.id === 'clean-md-to-multi-format');

console.log('--- Rendered Output ---');
console.log(marked.parse(target.long_description));
