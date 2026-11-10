const sharp = require('sharp');
const fs = require('fs');

async function processLogo() {
  const inputPath = 'C:\\Users\\SAHIL\\.gemini\\antigravity-ide\\brain\\ce51294e-3068-4bed-91ac-535546e12ad0\\.user_uploaded\\media_1790937693592.png';
  const outputPath = 'public/images/itmu_ehaat_logo.png';
  const tempPath = 'scratch/itmu_ehaat_logo_clean.png';

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Step 1: Flood fill from outer edges to identify background connected pixels
  const isBg = new Uint8Array(width * height); // 1 = background, 0 = foreground
  const visited = new Uint8Array(width * height);
  const queue = [];

  function getIdx(x, y) {
    return (y * width + x) * channels;
  }

  function isBackgroundPixel(r, g, b) {
    // Background is off-white: R,G,B high and low saturation (chroma)
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const chroma = maxC - minC;

    // Green leaf highlights have G noticeably higher than R/B
    const greenTint = g - r;
    if (greenTint > 4 && g > 200) return false; // leaf highlight!

    // If lightness is high and chroma is low, it's background
    if (minC >= 235 && chroma <= 8) return true;
    if (minC >= 242 && chroma <= 12) return true;
    return false;
  }

  // Push border pixels
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pIdx = y * width + x;

    if (visited[pIdx]) continue;
    visited[pIdx] = 1;

    const idx = pIdx * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    if (isBackgroundPixel(r, g, b)) {
      isBg[pIdx] = 1;

      // Add 4-neighbors
      if (x > 0 && !visited[pIdx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[pIdx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[pIdx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[pIdx + width]) queue.push(x, y + 1);
    }
  }

  // Also check enclosed loops (like inside letter 'a', 'o', 'e') if they are pure neutral white background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      if (!isBg[pIdx]) {
        const idx = pIdx * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const minC = Math.min(r, g, b);
        const chroma = Math.max(r, g, b) - minC;
        if (minC >= 248 && chroma <= 5) {
          isBg[pIdx] = 1;
        }
      }
    }
  }

  // Step 2: Create Alpha channel with smooth edge anti-aliasing
  const outBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const idx = pIdx * channels;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isBg[pIdx]) {
        // Completely transparent
        outBuffer[idx] = r;
        outBuffer[idx + 1] = g;
        outBuffer[idx + 2] = b;
        outBuffer[idx + 3] = 0;
      } else {
        // Check if it's an anti-aliased edge pixel
        const minC = Math.min(r, g, b);
        const chroma = Math.max(r, g, b) - minC;

        // If it's a very light pixel near background (e.g. edge of dark text on light bg)
        if (minC > 210 && chroma < 15 && !(g - r > 4)) {
          // Smooth alpha transition
          const bgVal = 250;
          const fgVal = 210;
          const alphaFactor = (bgVal - minC) / (bgVal - fgVal);
          const alpha = Math.max(0, Math.min(255, Math.floor(255 * alphaFactor)));
          
          outBuffer[idx] = r;
          outBuffer[idx + 1] = g;
          outBuffer[idx + 2] = b;
          outBuffer[idx + 3] = alpha;
        } else {
          // Full opacity foreground
          outBuffer[idx] = r;
          outBuffer[idx + 1] = g;
          outBuffer[idx + 2] = b;
          outBuffer[idx + 3] = 255;
        }
      }
    }
  }

  // Step 3: Trim transparent margin so logo is nicely aligned, and save
  await sharp(outBuffer, {
    raw: { width, height, channels: 4 }
  })
  .trim() // trims empty transparent space around logo
  .png({ compressionLevel: 9 })
  .toFile(tempPath);

  // Copy to public/images/itmu_ehaat_logo.png
  fs.copyFileSync(tempPath, outputPath);
  console.log(`Successfully written transparent logo to ${outputPath} and ${tempPath}`);

  // Get metadata of generated logo
  const finalMeta = await sharp(outputPath).metadata();
  console.log('Final logo size:', finalMeta.width, 'x', finalMeta.height);
}

processLogo().catch(err => {
  console.error('Error generating clean logo:', err);
  process.exit(1);
});
