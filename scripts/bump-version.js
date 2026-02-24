import fs from 'fs';
import { resolve } from 'path';

const pkgPath = resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const dateStr = `${year}.${month}.${day}`;

const versionParts = (pkg.version || '0.0.0').split('.');
let oldDate = '';
let oldRev = '0';

if (versionParts.length >= 3) {
  oldDate = `${versionParts[0]}.${versionParts[1]}.${versionParts[2]}`;
  oldRev = versionParts[3] || '0';
}

let newRev = 0;
if (oldDate === dateStr) {
  newRev = parseInt(oldRev) + 1;
}

const newVersion = `${dateStr}.${newRev}`;
pkg.version = newVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Version bumped to: ${newVersion}`);
