const sharp = require('sharp');
const path = require('path');

async function analyze() {
  const inputPath = 'C:\\Users\\SAHIL\\.gemini\\antigravity-ide\\brain\\ce51294e-3068-4bed-91ac-535546e12ad0\\.user_uploaded\\media_1790937693592.png';
  const metadata = await sharp(inputPath).metadata();
  console.log('Metadata:', metadata);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('Raw info:', info);

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  function getPixel(x, y) {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
  }

  console.log('Top-Left (0,0):', getPixel(0, 0));
  console.log('Top-Right (w-1,0):', getPixel(width - 1, 0));
  console.log('Bottom-Left (0,h-1):', getPixel(0, height - 1));
  console.log('Bottom-Right (w-1,h-1):', getPixel(width - 1, height - 1));

  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = getPixel(x, y);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minG = Math.min(minG, g); maxG = Math.max(maxG, g);
      minB = Math.min(minB, b); maxB = Math.max(maxB, b);
    }
  }
  console.log(`Top 10 rows RGB range: R[${minR}-${maxR}], G[${minG}-${maxG}], B[${minB}-${maxB}]`);
}

analyze().catch(err => console.error(err));
