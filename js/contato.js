/* Formulário de contato → Supabase (tabela public.contatos)
   - Sem login: o visitante usa a chave publicável, que só permite INSERIR
     (regras de segurança/RLS no banco; ninguém consegue ler as mensagens pelo site).
   - A biblioteca supabase-js só é baixada quando a pessoa começa a usar o formulário,
     para não pesar no carregamento da página. */
(function () {
  'use strict';

  // ---- Configuração (chave PUBLICÁVEL: pode ficar no navegador) ----
  var SUPABASE_URL = 'https://wrxpekndmdhddkrwocwy.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_3yjRbLn2rlK7Mmlf7_pD2Q_k822WmEY';
  var SUPABASE_LIB = 'js/vendor/supabase-2.119.0.js'; // gerado por: npm run vendor
  var TABELA = 'contatos';

  var form = document.getElementById('form-contato');
  if (!form) return;

  var statusEl = form.querySelector('.form-status');
  var button = form.querySelector('.form-submit');
  var startedAt = 0;
  var client = null;
  var libPromise = null;

  function loadLib() {
    if (libPromise) return libPromise;
    libPromise = new Promise(function (resolve, reject) {
      if (window.supabase) return resolve(window.supabase);
      var s = document.createElement('script');
      s.src = SUPABASE_LIB;
      s.async = true;
      s.onload = function () { resolve(window.supabase); };
      s.onerror = function () { libPromise = null; reject(new Error('lib')); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function getClient() {
    return loadLib().then(function (sb) {
      if (!client) {
        client = sb.createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        });
      }
      return client;
    });
  }

  // Pré-carrega a biblioteca quando a pessoa interage com o formulário
  form.addEventListener('focusin', function () {
    if (!startedAt) startedAt = Date.now();
    loadLib().catch(function () {});
  }, { once: false });

  // ---- Validação ----
  var el = {
    nome: form.elements.nome,
    telefone: form.elements.telefone,
    email: form.elements.email,
    area: form.elements.area,
    preferencia: form.elements.preferencia,
    mensagem: form.elements.mensagem,
    consentimento: form.elements.consentimento,
    site: form.elements.site
  };

  function setError(input, msg) {
    var err = document.getElementById('e-' + input.name);
    if (err) err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    input.closest('.field').classList.toggle('has-error', !!msg);
  }

  function clean(v) { return (v || '').replace(/\s+/g, ' ').trim(); }

  function validate() {
    var ok = true;
    var first = null;
    var nome = clean(el.nome.value);
    var tel = clean(el.telefone.value);
    var email = clean(el.email.value);
    var digits = tel.replace(/\D/g, '');

    function fail(input, msg) { setError(input, msg); ok = false; if (!first) first = input; }
    [el.nome, el.telefone, el.email, el.consentimento].forEach(function (i) { setError(i, ''); });

    if (nome.length < 2) fail(el.nome, 'Informe o seu nome.');
    if (!tel && !email) {
      fail(el.telefone, 'Informe um telefone ou um e-mail para eu poder responder.');
    }
    if (tel && (digits.length < 10 || digits.length > 13)) fail(el.telefone, 'Confira o número, com DDD. Ex.: (27) 99999-9999.');
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail(el.email, 'Confira o e-mail digitado.');
    if (!el.consentimento.checked) fail(el.consentimento, 'Para enviar, marque a concordância com o uso dos dados.');

    if (first) first.focus();
    return ok;
  }

  // Limpa o erro do campo assim que a pessoa corrige
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
    if ((e.target === el.email || e.target === el.telefone) && el.telefone.getAttribute('aria-invalid') === 'true' && !clean(el.telefone.value)) setError(el.telefone, '');
  });

  function setStatus(type, msg) {
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
    statusEl.textContent = msg;
  }

  // ---- Envio ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', '');
    if (!validate()) return;

    // Proteção simples contra robôs: campo-armadilha preenchido ou envio instantâneo
    var bot = clean(el.site.value) !== '' || (startedAt && Date.now() - startedAt < 2500);
    if (bot) { success(); return; }

    var payload = {
      nome: clean(el.nome.value),
      telefone: clean(el.telefone.value) || null,
      email: clean(el.email.value).toLowerCase() || null,
      area: el.area.value,
      preferencia: el.preferencia.value,
      mensagem: (el.mensagem.value || '').trim().slice(0, 2000) || null,
      consentimento: true
    };

    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Enviando…';

    getClient()
      .then(function (sb) { return sb.from(TABELA).insert(payload); })
      .then(function (res) {
        if (res.error) throw res.error;
        success();
      })
      .catch(function (err) {
        if (window.console) console.error('Formulário de contato:', err);
        setStatus('error', 'Não foi possível enviar agora. Tente novamente em instantes ou fale comigo pelo WhatsApp: (27) 99237-4007.');
      })
      .then(function () {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.textContent = 'Enviar mensagem';
      });
  });

  function success() {
    form.reset();
    startedAt = 0;
    setStatus('success', 'Mensagem enviada! Obrigado pelo contato. Retorno em breve pelo meio que você escolheu.');
    statusEl.setAttribute('tabindex', '-1');
    statusEl.focus();
  }
})();
