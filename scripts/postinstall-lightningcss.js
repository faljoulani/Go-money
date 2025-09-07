// Ensure lightningcss + tailwind oxide native bindings are present on this platform.
// This helps Windows and CI where optional deps/scripts may be skipped.

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function tryRequireLightning() {
  try {
    require('lightningcss');
    console.log('lightningcss OK');
    return true;
  } catch (e) {
    console.warn('lightningcss not ready:', e && e.message);
    return false;
  }
}

function platformSuffix() {
  const os = process.platform;
  const arch = process.arch;
  if (os === 'win32') return 'win32-x64-msvc';
  if (os === 'linux') return arch === 'arm64' ? 'linux-arm64-gnu' : 'linux-x64-gnu';
  if (os === 'darwin') return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  return null;
}

(async () => {
  if (tryRequireLightning()) return;

  try {
    const cmd = process.platform === 'win32'
      ? 'npm.cmd rebuild lightningcss --foreground-scripts'
      : 'npm rebuild lightningcss --foreground-scripts';
    console.log('Attempting to rebuild lightningcss…');
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.warn('Rebuild failed:', e && e.message);
  }

  if (!tryRequireLightning()) {
    try {
      const suf = platformSuffix();
      if (suf) {
        const lcPkg = `lightningcss-${suf}`;
        console.log('Installing prebuilt:', lcPkg);
        execSync(`${process.platform === 'win32' ? 'npm.cmd' : 'npm'} i --no-save --foreground-scripts ${lcPkg}` , { stdio: 'inherit' });
        // Copy .node next to wrapper for robust require path
        try {
          const nodeName = `lightningcss.${suf}.node`;
          const src = require.resolve(`${lcPkg}/${nodeName}`);
          const resolved = require.resolve('lightningcss');
          const dir = path.dirname(resolved); // .../lightningcss/node
          const base = path.resolve(dir, '..'); // .../lightningcss
          const dst1 = path.join(base, nodeName); // preferred (../lightningcss.*.node)
          const dst2 = path.join(dir, nodeName);  // secondary
          fs.copyFileSync(src, dst1);
          console.log('Copied', src, '→', dst1);
          try { fs.copyFileSync(src, dst2); console.log('Copied', src, '→', dst2); } catch {}
        } catch (e) {
          console.warn('Copy failed:', e && e.message);
        }
      }
    } catch (e) {
      console.warn('Prebuilt install failed:', e && e.message);
    }

    if (!tryRequireLightning()) {
      console.warn('WARNING: lightningcss still missing — CSS build may fail on this platform.');
    }
  }

  try {
    require('@tailwindcss/oxide');
  } catch {
    try {
      const suf = platformSuffix();
      if (suf) {
        const oxPkg = `@tailwindcss/oxide-${suf}`;
        console.log('Installing prebuilt:', oxPkg);
        execSync(`${process.platform === 'win32' ? 'npm.cmd' : 'npm'} i --no-save --foreground-scripts ${oxPkg}`, { stdio: 'inherit' });
      }
    } catch (e) {
      console.warn('Oxide prebuilt install failed:', e && e.message);
    }
  }
})();
