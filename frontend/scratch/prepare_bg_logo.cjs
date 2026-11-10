const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processBgLogo() {
  const inputPath = 'C:\\Users\\SAHIL\\.gemini\\antigravity-ide\\brain\\ce51294e-3068-4bed-91ac-535546e12ad0\\.user_uploaded\\media_1790937693592.png';
  const outputPath = path.join(__dirname, '../public/images/itmu_ehaat_logo_bg.png');

  // Let's trim excess padding so the logo content with its background is tight and well-proportioned
  const trimmedBuffer = await sharp(inputPath)
    .trim({
      threshold: 10 // trims near-white border space
    })
    .toBuffer();

  // Add a neat, clean, uniform margin (e.g. 16px) around the logo with background color #FEFEFC
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  const pad = 16;
  const newWidth = trimmedMeta.width + pad * 2;
  const newHeight = trimmedMeta.height + pad * 2;

  await sharp(trimmedBuffer)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 254, g: 254, b: 251, alpha: 1 }
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Saved background logo to ${outputPath} (${newWidth}x${newHeight})`);
}

processBgLogo().catch(err => {
  console.error('Error creating background logo:', err);
  process.exit(1);
});
