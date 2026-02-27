const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Output directory
const OUTPUT_DIR = path.join(projectRoot, 'src/renderer/assets/genLogo');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let inputPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputPath = args[i + 1];
      i++;
    }
  }

  return { inputPath };
}

// Validate input file
function validateInput(inputPath) {
  const absolutePath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(projectRoot, inputPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Input file not found: ${absolutePath}`);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  if (!['.svg', '.png'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Only .svg and .png are supported.`);
  }

  return { absolutePath, ext };
}

// Convert SVG to PNG using sharp
async function convertSvgToPng(svgPath, outputPngPath) {
  try {
    const sharp = require('sharp');
    await sharp(svgPath)
      .resize(1024, 1024)
      .png()
      .toFile(outputPngPath);
    console.log(`Converted SVG to PNG: ${outputPngPath}`);
  } catch (error) {
    throw new Error(
      `Failed to convert SVG to PNG: ${error.message}\n` +
      'Make sure sharp is installed: npm install sharp --save-dev'
    );
  }
}

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// Generate icons using electron-icon-maker
function generateIcons(pngPath, tempOutputDir) {
  console.log('\nGenerating icons from PNG...');
  execSync(`npx electron-icon-maker --input="${pngPath}" --output="${tempOutputDir}"`, {
    stdio: 'inherit'
  });
}

// Copy generated icons to output location
function copyIcons(tempOutputDir) {
  const iconsDir = path.join(tempOutputDir, 'icons');

  const sources = {
    icns: path.join(iconsDir, 'mac/icon.icns'),
    png: path.join(iconsDir, 'png/1024x1024.png'),
    ico: path.join(iconsDir, 'win/icon.ico')
  };

  const destinations = {
    icns: path.join(OUTPUT_DIR, 'icon.icns'),
    png: path.join(OUTPUT_DIR, 'icon.png'),
    ico: path.join(OUTPUT_DIR, 'icon.ico')
  };

  console.log('\nCopying icons to output location...');

  for (const [key, src] of Object.entries(sources)) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, destinations[key]);
      console.log(`  ${key} -> ${destinations[key]}`);
    } else {
      console.warn(`  Warning: Source file not found: ${src}`);
    }
  }
}

// Clean up temporary files
function cleanup(tempOutputDir) {
  if (fs.existsSync(tempOutputDir)) {
    fs.rmSync(tempOutputDir, { recursive: true, force: true });
    console.log('\nCleaned up temporary files.');
  }
}

// Main function
async function main() {
  const { inputPath } = parseArgs();

  if (!inputPath) {
    console.error('Usage: node gen-logo.js --input <path-to-svg-or-png>');
    console.error('\nExamples:');
    console.error('  npm run gen:logo -- --input src/renderer/assets/originalLogo.svg');
    console.error('  npm run gen:logo -- --input src/renderer/assets/logo.png');
    process.exit(1);
  }

  console.log('=== Logo Generation Script ===\n');

  try {
    // Validate input
    const { absolutePath, ext } = validateInput(inputPath);
    console.log(`Input file: ${absolutePath}`);

    // Create temp directory for icon generation (must be created before SVG conversion)
    const tempOutputDir = path.join(projectRoot, '.temp-icons');
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }

    // Ensure output directory exists
    ensureOutputDir();

    let pngPath;
    if (ext === '.svg') {
      console.log('\nDetected SVG input, converting to PNG...');
      pngPath = path.join(tempOutputDir, 'temp-input.png');
      await convertSvgToPng(absolutePath, pngPath);
    } else {
      pngPath = absolutePath;
    }

    // Generate icons
    generateIcons(pngPath, tempOutputDir);

    // Copy to output location
    copyIcons(tempOutputDir);

    // Cleanup
    cleanup(tempOutputDir);

    console.log('\n=== Logo generation complete! ===');
    console.log('\nGenerated files:');
    console.log(`  - ${OUTPUT_DIR}/icon.icns (macOS)`);
    console.log(`  - ${OUTPUT_DIR}/icon.ico (Windows)`);
    console.log(`  - ${OUTPUT_DIR}/icon.png (Generic)`);

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();