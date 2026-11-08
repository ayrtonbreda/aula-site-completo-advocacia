// Copia o build de navegador (UMD) do supabase-js de node_modules para js/vendor/.
// O site não tem etapa de build: o arquivo copiado é versionado no Git e servido direto.
// Uso (após atualizar a versão no package.json): npm install && npm run vendor
const fs = require('fs');
const path = require('path');

const pkg = require('@supabase/supabase-js/package.json');
const src = path.join(path.dirname(require.resolve('@supabase/supabase-js/package.json')), 'dist', 'umd', 'supabase.js');
const outDir = path.join(__dirname, '..', 'js', 'vendor');
const out = path.join(outDir, `supabase-${pkg.version}.js`);

fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (/^supabase-.*\.js$/.test(f)) fs.unlinkSync(path.join(outDir, f));
fs.copyFileSync(src, out);
console.log(`supabase-js ${pkg.version} -> ${path.relative(process.cwd(), out)}`);
console.log('Lembre de atualizar SUPABASE_LIB em js/contato.js se a versão mudou.');
