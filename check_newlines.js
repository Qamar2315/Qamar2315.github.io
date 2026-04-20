const fs = require('fs');

function checkFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const json = JSON.parse(content);

    let items = [];
    if (Array.isArray(json)) {
        items = json;
    } else if (typeof json === 'object') {
        // Handle object with arrays inside (like profile.json or education.json might be)
        // But projects.json and experience.json are arrays
        items = [json]; // simplify
    }

    console.log(`Checking ${filepath}...`);

    items.forEach((item, index) => {
        const id = item.id || index;
        if (item.long_description) {
            const desc = item.long_description;
            console.log(`[${id}] long_description:`);
            console.log(`  Contains literal \\n (backslash+n): ${desc.includes('\\n')}`);
            console.log(`  Contains actual newline character: ${desc.includes('\n')}`);
            console.log(`  Preview: ${JSON.stringify(desc).substring(0, 100)}...`);

            // specific check for list
            if (desc.includes('1. **')) {
               console.log(`  Has list item. Preceding chars: ...${JSON.stringify(desc.substring(desc.indexOf('1. **') - 10, desc.indexOf('1. **')))}`);
            }
        }

        // Also check responsibilities in experience.json which might be strings or objects
        if (item.responsibilities) {
             // ...
        }
    });
    console.log('---');
}

try {
    checkFile('json_data/projects.json');
    checkFile('json_data/experience.json');
} catch (e) {
    console.error(e);
}
