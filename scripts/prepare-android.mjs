import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const resourcesDir = path.join(root, 'resources');
const iconPath = path.join(resourcesDir, 'icon.png');

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const executable = process.platform === 'win32' && ['npx', 'npm'].includes(command) ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(iconPath)) {
  console.error(`Missing Android app icon: ${iconPath}`);
  process.exit(1);
}

// Build the web application before Capacitor syncs it into Android.
run('npm', ['run', 'build']);

// Generate the native Android project only once. GitHub Actions starts from a
// clean checkout, while local development can safely reuse an existing project.
if (!fs.existsSync(androidDir)) {
  run('npx', ['cap', 'add', 'android']);
} else {
  console.log('\nAndroid platform already exists; reusing it.');
}

// Generate Android launcher icons from resources/icon.png.
// @capacitor/assets supports the resources/ folder directly.
run('npx', [
  '@capacitor/assets',
  'generate',
  '--android',
  '--assetPath',
  'resources',
  '--iconBackgroundColor',
  '#ffffff',
  '--iconBackgroundColorDark',
  '#222222',
]);

// Copy web assets and synchronize all Capacitor plugins/native configuration.
run('npx', ['cap', 'sync', 'android']);

// Configure the AdMob App ID in AndroidManifest.xml. If no production App ID
// is supplied, the script intentionally uses Google's test App ID.
run('node', ['scripts/prepare-android-admob.mjs']);

console.log('\nAndroid preparation completed successfully.');
