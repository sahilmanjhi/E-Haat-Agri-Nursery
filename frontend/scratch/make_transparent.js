const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/images/itmu_ehaat_logo.png');
  const outputPath = path.join(__dirname, '../public/images/itmu_ehaat_logo.png');
  const tempPath = path.join(__dirname, '../public/images/itmu_ehaat_logo_temp.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is white / light off-white background
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);

    // Pure white or very light background
    if (r > 235 && g > 235 && b > 235) {
      data[i + 3] = 0; // Completely transparent
    } else if (r > 210 && g > 210 && b > 210) {
      // Smooth anti-aliasing edge fading for light border pixels
      const avg = (r + g + b) / 3;
      const alphaFactor = (235 - avg) / (235 - 210);
      data[i + 3] = Math.max(0, Math.min(255, Math.floor(data[i + 3] * alphaFactor)));
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
  .png()
  .toFile(tempPath);

  // Overwrite original file
  const fs = require('fs');
  fs.renameSync(tempPath, outputPath);
  console.log('Logo background converted to transparent PNG successfully!');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
