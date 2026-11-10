const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("background: '#FFF'", "background: 'transparent'");
content = content.replace("padding: '4px'", "padding: '0'");
content = content.replace("borderRadius: '6px'", "borderRadius: '0'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Footer.jsx to use transparent background!');
