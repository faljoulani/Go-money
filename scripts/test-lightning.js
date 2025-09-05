try {
  const lc = require('lightningcss');
  console.log('lightningcss OK, transform is', typeof lc.transform);
  process.exit(0);
} catch (e) {
  console.error('lightningcss FAIL:', e && e.message);
  process.exit(1);
}

