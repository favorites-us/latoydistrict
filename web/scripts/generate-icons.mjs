// Reproduce the header's Lucide Boxes mark; all assets generated locally.
// Run from web/: node scripts/generate-icons.mjs
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Boxes } from 'lucide-react';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const mark = renderToStaticMarkup(createElement(Boxes, { size: 120, strokeWidth: 1.7, color: 'white', x: 30, y: 30 }));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" rx="56" fill="#087657"/>${mark}</svg>`;
const app = new URL('../app/', import.meta.url);
await writeFile(new URL('icon.svg', app), svg);
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(new URL('apple-icon.png', app).pathname);
const png = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // ICO type
header.writeUInt16LE(1, 4); // one image
header[6] = 32; header[7] = 32;
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
await writeFile(new URL('favicon.ico', app), Buffer.concat([header, png]));
