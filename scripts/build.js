// Build do site: copia os arquivos públicos para dist/ e gera dist/js/config.js
// com as variáveis de ambiente do Supabase.
//
//   Local:   lê o arquivo .env      →  npm run build
//   Vercel:  lê Settings → Environment Variables (roda sozinho a cada deploy)
//
// Sem dependências: só Node.js.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// 1) Variáveis de ambiente -------------------------------------------------
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const url = (process.env.VITE_SUPABASE_URL || '').trim();
const key = (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

function fail(msg) {
  console.error('\n✖ Build interrompido: ' + msg + '\n');
  process.exit(1);
}
if (!url || !key) {
  fail('defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY ' +
       '(no arquivo .env localmente, ou em Vercel → Settings → Environment Variables).');
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
  fail('VITE_SUPABASE_URL inválida. Formato esperado: https://SEU-PROJETO.supabase.co');
}
// Proteção: a chave vai para o navegador, então só a PUBLICÁVEL é aceita.
if (/^sb_secret_/.test(key) || /service_role/.test(Buffer.from(key.split('.')[1] || '', 'base64').toString())) {
  fail('VITE_SUPABASE_PUBLISHABLE_KEY contém uma chave SECRETA. Use a chave publicável (sb_publishable_...).');
}
if (!/^sb_publishable_/.test(key) && !/^eyJ/.test(key)) {
  fail('VITE_SUPABASE_PUBLISHABLE_KEY não parece uma chave do Supabase (esperado: sb_publishable_...).');
}

// 2) Copia os arquivos públicos ----------------------------------------------
const PUBLIC = ['index.html', 'privacidade.html', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'css', 'js', 'assets'];
// Originais da marca que não são usados pelo site
const SKIP = new Set([
  'assets/foto-ayrton.jpg.jpg', 'assets/logo-horizontal.jpg.jpg',
  'assets/logo-quadrado.jpg.png', 'assets/logo-vertical.jpg.png',
  'js/config.js'
]);

fs.rmSync(DIST, { recursive: true, force: true });
let count = 0;
function copy(rel) {
  if (SKIP.has(rel.replace(/\\/g, '/'))) return;
  const src = path.join(ROOT, rel);
  const dst = path.join(DIST, rel);
  if (fs.statSync(src).isDirectory()) {
    for (const f of fs.readdirSync(src)) copy(path.join(rel, f));
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    count++;
  }
}
PUBLIC.forEach(copy);

// 3) Gera a configuração lida pelo formulário ---------------------------------
const config =
  '/* Gerado automaticamente por scripts/build.js — não edite. */\n' +
  'window.SITE_CONFIG = Object.freeze(' +
  JSON.stringify({ supabaseUrl: url.replace(/\/$/, ''), supabaseKey: key }, null, 2) +
  ');\n';
fs.writeFileSync(path.join(DIST, 'js', 'config.js'), config);

console.log(`✔ Build ok: ${count + 1} arquivos em dist/ (Supabase: ${url})`);
