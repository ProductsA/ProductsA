const sharp = require('sharp');
const path = require('path');

const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#b45309"/><text x="256" y="370" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="320" font-weight="700" fill="#fffbeb">S</text></svg>');

async function generate() {
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join('public', 'favicon.png'));
  await sharp(svgBuffer).resize(64, 64).png().toFile(path.join('public', 'icon-64.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join('public', 'apple-touch-icon.png'));
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join('public', 'icon-192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join('public', 'icon-512.png'));
  console.log('All icons generated');
}
generate().catch(console.error);
