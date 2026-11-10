const sharp = require('sharp');

async function inspectLightPixels() {
  const inputPath = 'C:\\Users\\SAHIL\\.gemini\\antigravity-ide\\brain\\ce51294e-3068-4bed-91ac-535546e12ad0\\.user_uploaded\\media_1790937693592.png';
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  let lightGreen = [];
  let neutralLight = [];

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > 200 && g > 200 && b > 200) {
      // Check difference between channels
      const diffRG = Math.abs(r - g);
      const diffGB = Math.abs(g - b);
      const diffRB = Math.abs(r - b);
      const maxDiff = Math.max(diffRG, diffGB, diffRB);

      if (maxDiff > 10) {
        lightGreen.push({ r, g, b, maxDiff });
      } else {
        neutralLight.push({ r, g, b });
      }
    }
  }

  console.log(`Neutral light pixels (background candidate): ${neutralLight.length}`);
  console.log(`Colored light pixels (potential leaf highlight / edge): ${lightGreen.length}`);
  if (lightGreen.length > 0) {
    console.log('Sample colored light pixels:', lightGreen.slice(0, 10));
  }
}

inspectLightPixels().catch(console.error);
