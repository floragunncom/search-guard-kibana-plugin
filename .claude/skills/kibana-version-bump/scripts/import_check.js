// Static check of every `@kbn/*` import in the plugin sources against the Kibana checkout.
// Usage (from the Kibana checkout, with Kibana's Node on PATH):
//   node .claude/skills/kibana-version-bump/scripts/import_check.js <plugin repo dir>
// Babel only transpiles server code; a named import that no longer exists becomes `undefined`
// silently (Kibana 9.5: `KibanaResponse` from '@kbn/core-http-server' is a type only, the class
// moved to '@kbn/core-http-router-server-internal'). This loads each package through Kibana's
// setup_node_env and reports named imports that resolve to undefined.
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const repo = path.resolve(process.argv[2] || '.');
const kibanaDir = process.cwd();
require(path.join(kibanaDir, 'src/setup_node_env'));
// resolve packages from the Kibana checkout, not from this script's location
const kbnRequire = createRequire(path.join(kibanaDir, 'package.json'));

const files = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'build' || e.name === 'target' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|ts|tsx|jsx)$/.test(e.name) && !/\.(test|mock|mocks|test\.mocks)\./.test(e.name)) files.push(p);
  }
};
for (const d of ['server', 'common', 'public']) if (fs.existsSync(path.join(repo, d))) walk(path.join(repo, d));

// package -> Map(name -> Set(files))
const wanted = new Map();
const add = (pkg, name, file) => {
  if (!wanted.has(pkg)) wanted.set(pkg, new Map());
  const m = wanted.get(pkg);
  if (!m.has(name)) m.set(name, new Set());
  m.get(name).add(path.relative(repo, file));
};
const importRe = /import\s+(type\s+)?([\w$*{},\s]+?)\s+from\s+['"](@kbn\/[^'"]+)['"]/g;
const requireRe = /(?:const|let|var)\s+(\{[\w$,\s:]*?\}|\w+)\s*=\s*require\(\s*['"](@kbn\/[^'"]+)['"]\s*\)/g;
const parseClause = (clause) => {
  const names = [];
  const braces = clause.match(/\{([\s\S]*?)\}/);
  if (braces) {
    for (const part of braces[1].split(',')) {
      const t = part.trim();
      if (!t || t.startsWith('type ')) continue;
      names.push(t.split(/\s+as\s+/)[0].trim());
    }
  }
  const rest = clause.replace(/\{[\s\S]*?\}/, '').trim();
  if (rest) for (const r of rest.split(',')) { const t = r.trim(); if (t && !t.startsWith('*')) names.push('default'); if (t.startsWith('*')) names.push('*'); }
  return names;
};
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = importRe.exec(src))) { if (m[1]) continue; for (const n of parseClause(m[2])) add(m[3], n, f); }
  while ((m = requireRe.exec(src))) { for (const n of parseClause(m[1].startsWith('{') ? m[1] : 'default')) add(m[2], n, f); }
}

let missing = 0, unverifiable = 0;
const pkgs = [...wanted.keys()].sort();
for (const pkg of pkgs) {
  let mod;
  try { mod = kbnRequire(pkg); } catch (e) {
    unverifiable++;
    console.log(`UNVERIFIABLE ${pkg}: cannot load in Node (${(e.message || '').split('\n')[0].slice(0, 120)}) - browser-only package? check manually: ${[...wanted.get(pkg).keys()].join(', ')}`);
    continue;
  }
  for (const [name, users] of wanted.get(pkg)) {
    if (name === '*' || name === 'default') continue;
    if (typeof mod[name] === 'undefined') {
      missing++;
      console.log(`MISSING ${pkg} -> ${name}   (used in ${[...users].join(', ')})`);
    }
  }
}
console.log(`checked ${pkgs.length} packages from ${files.length} files: ${missing} missing export(s), ${unverifiable} package(s) not loadable in Node`);
console.log(missing ? 'IMPORT_CHECK_FAILED' : 'IMPORT_CHECK_OK');
process.exit(missing ? 1 : 0);
