const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const inputPath = 'C:\\Users\\SAHIL\\.gemini\\antigravity-ide\\brain\\ce51294e-3068-4bed-91ac-535546e12ad0\\.user_uploaded\\media_1790937693592.png';
  const outputPath = 'public/images/itmu_ehaat_logo.png';
  const debugPath = 'scratch/test_out.png';

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Let's inspect min/max values of logo green vs background
  // Background pixels are mostly light: R > 230, G > 230, B > 220
  // Logo pixels are green: G > R or dark green or green gradients.

  // Let's create an alpha channel array
  // For each pixel, determine if it's background or foreground, with anti-aliasing
  const newData = Buffer.alloc(width * height * 4);

  let bgCount = 0;
  let fgCount = 0;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Compute lightness / distance to background color
    // Background is near [254, 254, 251]
    const isBg = (r > 240 && g > 240 && b > 235);
    
    newData[i] = r;
    newData[i + 1] = g;
    newData[i + 2] = b;

    if (r > 245 && g > 245 && b > 240) {
      // Completely transparent background
      newData[i + 3] = 0;
      bgCount++;
    } else if (r > 215 && g > 215 && b > 205) {
      // Transition / anti-aliased edge
      // Distance from 245 background threshold down to 215 edge threshold
      const bgDist = Math.max(r, g, b);
      // Linear falloff for smooth edges
      const alpha = Math.floor(255 * (245 - bgDist) / (245 - 215));
      newData[i + 3] = Math.max(0, Math.min(255, alpha));
    } else {
      // Foreground
      newData[i + 3] = 255;
      fgCount++;
    }
  }

  console.log(`BG pixels: ${bgCount}, FG pixels: ${fgCount}`);

  await sharp(newData, {
    raw: { width, height, channels: 4 }
  })
  .trim() // Trim transparent padding around the logo so it fits nicely
  .png({ compressionLevel: 9 })
  .toFile(debugPath);

  console.log('Saved debug output to', debugPath);
}

processImage().catch(console.error);
