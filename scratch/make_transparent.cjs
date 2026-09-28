const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo(filename) {
  const inputPath = path.join(__dirname, '../public/images', filename);
  const tempPath = path.join(__dirname, '../public/images', `temp_${filename}`);

  if (!fs.existsSync(inputPath)) {
    console.warn(`File ${filename} not found, skipping.`);
    return;
  }

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

  fs.copyFileSync(tempPath, inputPath);
  fs.unlinkSync(tempPath);
  console.log(`Background converted to transparent PNG for ${filename} successfully!`);
}

async function run() {
  await processLogo('itm_logo.png');
  await processLogo('itmu_ehaat_logo.png');
}

run().catch(err => {
  console.error('Error processing logos:', err);
  process.exit(1);
});
