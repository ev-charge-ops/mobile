import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = resolve(root, 'assets/images');

const ink = '#111316';
const white = '#FFFFFF';
const energy = '#3DDC84';

const ringPath = 'M45.02 42.93 A17 17 0 1 1 45.02 21.07';
const boltPath = 'M34 20 L24 34 H31 L29 44 L40 29 H33 Z';

function mark({ ring = white, bolt = energy, dot = energy, strokeWidth = 5, withDot = true } = {}) {
  const dotNode = withDot ? `<circle cx="45.02" cy="21.07" r="3.4" fill="${dot}"/>` : '';
  return [
    `<path d="${ringPath}" fill="none" stroke="${ring}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`,
    `<path d="${boltPath}" fill="${bolt}"/>`,
    dotNode,
  ].join('');
}

function svg(viewBox, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`;
}

function tile(viewBox, radius = 0) {
  const [x, y, width, height] = viewBox.split(' ').map(Number);
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${ink}"/>`;
}

const adaptiveViewBox = '-7 -7 78 78';
const splashViewBox = '12 12 40 40';

const assets = [
  { file: 'icon.png', size: 1024, svg: svg('0 0 64 64', tile('0 0 64 64') + mark()) },
  { file: 'android-icon-foreground.png', size: 512, svg: svg(adaptiveViewBox, mark()) },
  { file: 'android-icon-background.png', size: 512, svg: svg('0 0 64 64', tile('0 0 64 64')) },
  {
    file: 'android-icon-monochrome.png',
    size: 432,
    svg: svg(adaptiveViewBox, mark({ ring: white, bolt: white, dot: white })),
  },
  { file: 'splash-icon.png', size: 512, svg: svg(splashViewBox, mark()) },
  {
    file: 'favicon.png',
    size: 48,
    svg: svg('0 0 64 64', tile('0 0 64 64', 15) + mark({ strokeWidth: 7, withDot: false })),
  },
];

for (const asset of assets) {
  const png = new Resvg(asset.svg, { fitTo: { mode: 'width', value: asset.size } }).render().asPng();
  await writeFile(resolve(imagesDir, asset.file), png);
  console.log(`${asset.file} ${asset.size}px`);
}
