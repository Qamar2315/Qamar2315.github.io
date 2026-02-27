const fs = require('fs');

const path = 'json_data/experience.json';
const data = fs.readFileSync(path, 'utf8');
const experience = JSON.parse(data);

console.log('--- Checking experience.json ---');
experience.forEach((job, idx) => {
    console.log(`Job ${idx + 1}: ${job.title}`);
    if (job.responsibilities) {
        job.responsibilities.forEach((resp, rIdx) => {
            if (typeof resp === 'string') {
                console.log(`  Resp ${rIdx + 1} (string): contains \\n? ${resp.includes('\\n')}, contains newline char? ${resp.includes('\n')}`);
            } else if (typeof resp === 'object' && resp.details) {
                console.log(`  Resp ${rIdx + 1} (object): details.long_description contains \\n? ${resp.details.long_description.includes('\\n')}, contains newline char? ${resp.details.long_description.includes('\n')}`);
            }
        });
    }
});
