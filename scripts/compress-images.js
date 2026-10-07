'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const outputRoot = path.join(root, 'optimized');
const ignoredDirectories = new Set(['.git', 'node_modules', 'optimized']);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function findImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        images.push(...await findImages(path.join(directory, entry.name)));
      }
    } else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      images.push(path.join(directory, entry.name));
    }
  }

  return images;
}

async function compressImage(sourcePath) {
  const relativePath = path.relative(root, sourcePath);
  const outputPath = path.join(outputRoot, relativePath.replace(/\.[^.]+$/, '.webp'));
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(sourcePath)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(outputPath);

  const { size } = await fs.stat(outputPath);
  return { sourceBytes: (await fs.stat(sourcePath)).size, outputBytes: size };
}

async function main() {
  const images = await findImages(root);
  let sourceBytes = 0;
  let outputBytes = 0;

  for (const image of images) {
    const result = await compressImage(image);
    sourceBytes += result.sourceBytes;
    outputBytes += result.outputBytes;
  }

  const reduction = sourceBytes ? Math.round((1 - outputBytes / sourceBytes) * 100) : 0;
  console.log(`Optimized ${images.length} images: ${(sourceBytes / 1024 / 1024).toFixed(1)} MB -> ${(outputBytes / 1024 / 1024).toFixed(1)} MB (${reduction}% smaller).`);
  console.log(`Output: ${path.relative(root, outputRoot)}`);
}

main().catch(error => {
  console.error('Image compression failed:', error);
  process.exitCode = 1;
});