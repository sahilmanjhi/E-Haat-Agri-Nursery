const fs = require('fs');
const path = require('path');

// 1. Update OurStory.jsx
const ourStoryPath = path.join(__dirname, '../src/components/OurStory.jsx');
let ourStoryContent = fs.readFileSync(ourStoryPath, 'utf8');

const oldOurStoryImg = `                <img
                  src="/images/itmu_ehaat_logo.png"
                  alt="ITMU e-haat Logo"
                  style={{
                    height: '44px',
                    width: 'auto',
                    background: 'transparent',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                />`;

const newOurStoryImg = `                <img
                  src="/images/itmu_ehaat_logo_bg.png"
                  alt="ITMU e-haat Logo"
                  style={{
                    height: '44px',
                    width: 'auto',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                />`;

if (ourStoryContent.includes('src="/images/itmu_ehaat_logo.png"')) {
  ourStoryContent = ourStoryContent.replace(
    'src="/images/itmu_ehaat_logo.png"',
    'src="/images/itmu_ehaat_logo_bg.png"'
  );
  ourStoryContent = ourStoryContent.replace(
    "background: 'transparent',\n                    objectFit: 'contain',\n                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'",
    "objectFit: 'contain',\n                    borderRadius: '6px',\n                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'"
  );
  fs.writeFileSync(ourStoryPath, ourStoryContent, 'utf8');
  console.log('Updated OurStory.jsx successfully!');
} else {
  console.log('OurStory.jsx already updated or string not matched.');
}

// 2. Update Footer.jsx
const footerPath = path.join(__dirname, '../src/components/Footer.jsx');
let footerContent = fs.readFileSync(footerPath, 'utf8');

if (footerContent.includes('src="/images/itmu_ehaat_logo.png"')) {
  footerContent = footerContent.replace(
    'src="/images/itmu_ehaat_logo.png"',
    'src="/images/itmu_ehaat_logo_bg.png"'
  );
  footerContent = footerContent.replace(
    "background: 'transparent',\n                  padding: '0',\n                  borderRadius: '0'",
    "borderRadius: '6px'"
  );
  fs.writeFileSync(footerPath, footerContent, 'utf8');
  console.log('Updated Footer.jsx successfully!');
} else {
  console.log('Footer.jsx already updated or string not matched.');
}
