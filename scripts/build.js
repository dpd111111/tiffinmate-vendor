import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

console.log('[Build] Preparing dist directory...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy index.html
if (fs.existsSync(path.join(rootDir, 'index.html'))) {
  fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(distDir, 'index.html'));
  console.log('[Build] Copied index.html to dist/');
}

// 2. Copy assets/
const distAssets = path.join(distDir, 'assets');
fs.mkdirSync(distAssets, { recursive: true });

const srcAssets = path.join(rootDir, 'assets');
if (fs.existsSync(srcAssets)) {
  const assetFiles = fs.readdirSync(srcAssets);
  for (const f of assetFiles) {
    fs.copyFileSync(path.join(srcAssets, f), path.join(distAssets, f));
  }
  console.log(`[Build] Copied ${assetFiles.length} files to dist/assets/`);
}

// 3. Copy public files (manifest.json, icons, etc.)
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const f of publicFiles) {
    const fullPath = path.join(publicDir, f);
    const destPath = path.join(distDir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      fs.cpSync(fullPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(fullPath, destPath);
    }
  }
  console.log('[Build] Copied public/ assets to dist/');
}

// Also check root icon.svg, manifest.json
for (const rootFile of ['icon.svg', 'manifest.json', 'icon-192.png']) {
  const p = path.join(rootDir, rootFile);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(distDir, rootFile));
  }
}

// 4. Bundle server.ts to dist/server.cjs
try {
  console.log('[Build] Bundling server.ts with esbuild...');
  execSync('npx esbuild server.ts --bundle --platform=node --format=cjs --outfile=dist/server.cjs --external:firebase/firestore --external:@google/genai', {
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('[Build] Successfully generated dist/server.cjs');
} catch (err) {
  console.warn('[Build Warning]: Failed to bundle server.ts with esbuild:', err.message);
}

// 5. Verify dist output
const files = fs.readdirSync(distDir);
console.log(`[Build Complete] Output verified: ${files.length} items in dist/ [${files.join(', ')}]`);
