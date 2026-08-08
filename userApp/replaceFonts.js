const fs = require('fs');
const path = require('path');

function replaceFonts(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceFonts(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            if (content.includes("fontWeight: '800'")) {
                content = content.replace(/fontWeight: '800'/g, "fontWeight: '600'");
                updated = true;
            }
            if (content.includes("fontWeight: '900'")) {
                content = content.replace(/fontWeight: '900'/g, "fontWeight: '700'");
                updated = true;
            }
            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated fonts in ${fullPath}`);
            }
        }
    }
}

replaceFonts(path.join(__dirname, 'src'));
console.log('Font replacement complete.');
