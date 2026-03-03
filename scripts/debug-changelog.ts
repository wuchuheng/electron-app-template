import fs from 'fs';
import path from 'path';

async function testExtract(version: string) {
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
  console.log(`Testing extraction for version: ${version}`);
  
  try {
    const content = fs.readFileSync(changelogPath, 'utf-8');
    
    const escapedVersion = version.replace(/\./g, '\\.');
    const versionRegex = new RegExp(
      `^##\\s+\\[?v?${escapedVersion}\\]?\\s+-\\s+\\d{4}-\\d{2}-\\d{2}`,
      'm'
    );
    
    const match = content.match(versionRegex);
    if (!match || match.index === undefined) {
      console.log(`❌ Version ${version} not found in CHANGELOG.md using regex`);
      return;
    }

    console.log(`✅ Found version header: "${match[0]}"`);

    const startIndex = match.index + match[0].length;
    const nextVersionRegex = /^##\s+/m;
    const remainingContent = content.slice(startIndex);
    const nextMatch = remainingContent.match(nextVersionRegex);
    
    let body = nextMatch 
      ? remainingContent.slice(0, nextMatch.index).trim()
      : remainingContent.trim();

    body = body.split(/^---/m)[0].trim();

    console.log('\n--- Extracted Body Start ---');
    console.log(body);
    console.log('--- Extracted Body End ---');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testExtract('1.0.3');
