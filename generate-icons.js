import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_IMAGE = path.join(__dirname, 'public', 'logo.png');
const PUBLIC_DIR = path.join(__dirname, 'public');

async function generateIcons() {
  if (!fs.existsSync(INPUT_IMAGE)) {
    console.error(`Error: Input image not found at ${INPUT_IMAGE}`);
    process.exit(1);
  }

  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-512x512-maskable.png', size: 512, background: '#10b981', padding: 50 },
    { name: 'apple-touch-icon.png', size: 180, background: '#10b981' }
  ];

  for (const config of sizes) {
    const outputPath = path.join(PUBLIC_DIR, config.name);
    try {
      let image = sharp(INPUT_IMAGE);
      
      if (config.background) {
        // Create an image with a background for maskable and apple-touch
        const innerSize = config.size - (config.padding || 0) * 2;
        image = image.resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
        
        await sharp({
          create: {
            width: config.size,
            height: config.size,
            channels: 4,
            background: config.background
          }
        })
        .composite([{ input: await image.toBuffer(), gravity: 'center' }])
        .png()
        .toFile(outputPath);
      } else {
        await image.resize(config.size, config.size).png().toFile(outputPath);
      }
      
      console.log(`Generated: ${config.name}`);
    } catch (err) {
      console.error(`Error generating ${config.name}:`, err);
    }
  }
}

generateIcons();
