import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'android', 'app', 'src', 'main');
const manifestPath = path.join(appDir, 'AndroidManifest.xml');
const valuesDir = path.join(appDir, 'res', 'values');
const stringsPath = path.join(valuesDir, 'strings.xml');

if (!fs.existsSync(manifestPath)) {
  console.error('Android project not found. Run: npx cap add android');
  process.exit(1);
}

const testAppId = 'ca-app-pub-3940256099942544~3347511713';
const appId = process.env.ADMOB_APP_ID || testAppId;
fs.mkdirSync(valuesDir, { recursive: true });

let strings = fs.existsSync(stringsPath) ? fs.readFileSync(stringsPath, 'utf8') : '<resources>\n</resources>\n';
if (strings.includes('<string name="admob_app_id">')) {
  strings = strings.replace(/<string name="admob_app_id">.*?<\/string>/, `<string name="admob_app_id">${appId}</string>`);
} else {
  strings = strings.replace('</resources>', `  <string name="admob_app_id">${appId}</string>\n</resources>`);
}
fs.writeFileSync(stringsPath, strings);

let manifest = fs.readFileSync(manifestPath, 'utf8');
const meta = '<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id" />';
if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  manifest = manifest.replace(/<application([^>]*)>/, `<application$1>\n        ${meta}`);
}
fs.writeFileSync(manifestPath, manifest);
console.log(`AdMob Android App ID configured (${process.env.ADMOB_APP_ID ? 'production' : 'Google test ID'}).`);
