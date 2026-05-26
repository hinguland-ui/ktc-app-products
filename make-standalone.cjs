const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '../../');
const apiDir = path.resolve(__dirname);

// 1. Copy lib folders
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

console.log('Copying shared libs...');
copyFolderSync(path.join(root, 'lib/db/src'), path.join(apiDir, 'src/db'));
copyFolderSync(path.join(root, 'lib/api-zod/src'), path.join(apiDir, 'src/api-zod'));

// 2. Update imports in api-server/src
function replaceInFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Calculate relative path to src
      const relativeToSrc = path.relative(path.dirname(fullPath), path.join(apiDir, 'src'));
      const prefix = relativeToSrc === '' ? '.' : relativeToSrc;

      let changed = false;
      if (content.includes('@workspace/db')) {
        content = content.replace(/@workspace\/db(\/schema)?/g, (match, schema) => {
           return schema ? `${prefix}/db/schema` : `${prefix}/db`;
        });
        changed = true;
      }
      if (content.includes('@workspace/api-zod')) {
        content = content.replace(/@workspace\/api-zod/g, `${prefix}/api-zod`);
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  });
}
console.log('Fixing import paths...');
replaceInFiles(path.join(apiDir, 'src'));

// 3. Update package.json
console.log('Updating package.json dependencies...');
const pkgPath = path.join(apiDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

delete pkg.dependencies['@workspace/api-zod'];
delete pkg.dependencies['@workspace/db'];

pkg.dependencies['drizzle-orm'] = '^0.45.2';
pkg.dependencies['zod'] = '^3.25.76';
pkg.dependencies['pg'] = '^8.20.0';
pkg.dependencies['drizzle-zod'] = '^0.8.3';

pkg.devDependencies['@types/node'] = '^25.3.3';
pkg.devDependencies['@types/pg'] = '^8.20.0';
pkg.devDependencies['drizzle-kit'] = '^0.31.10';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// 4. Git commit and push
console.log('Committing and pushing...');
try {
  cp.execSync('git add .', { cwd: apiDir, stdio: 'inherit' });
  cp.execSync('git commit -m "chore: make api-server standalone"', { cwd: apiDir, stdio: 'inherit' });
  cp.execSync('git push origin main', { cwd: apiDir, stdio: 'inherit' });
  console.log('Successfully extracted and pushed!');
} catch(e) {
  console.log('Git commit/push warning:', e.message);
}
