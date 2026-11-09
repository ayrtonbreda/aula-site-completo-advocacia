// Edge Function: notificar-contato
// Chamada pelo banco (gatilho em public.contatos) a cada nova mensagem do formulário.
// Envia um e-mail de aviso pelo Resend (https://resend.com).
//
// Segredos (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   obrigatório — chave da conta no Resend
//   NOTIFY_TO        opcional    — destinatário (padrão: adv.ayrtonbreda@gmail.com)
//   NOTIFY_FROM      opcional    — remetente (padrão: site@ayrtonbredaadvogado.com.br,
//                                  domínio verificado no Resend com registros DNS na Hostinger)
//
// Segurança: a função não confia no conteúdo da chamada. Ela recebe só o id, busca a
// mensagem no banco com a chave secreta e marca "notificado_em" de forma atômica.
// Assim, ninguém consegue usar a função para mandar e-mails arbitrários nem repetir avisos.
import { createClient } from 'npm:@supabase/supabase-js@2.119.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const NOTIFY_TO = Deno.env.get('NOTIFY_TO') ?? 'adv.ayrtonbreda@gmail.com'
const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM') ?? 'Site Ayrton Brêda <site@ayrtonbredaadvogado.com.br>'

function secretKey(): string {
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')
    if (keys.default) return keys.default
  } catch (_) { /* usa a legada abaixo */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
}

const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
})

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  let id = ''
  try { id = String((await req.json())?.id ?? '') } catch (_) { /* corpo inválido */ }
  if (!UUID.test(id)) return json({ error: 'id' }, 400)

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada — e-mail não enviado para o contato', id)
    return json({ error: 'not_configured' }, 500)
  }

  // Marca como notificado (só se ainda não foi) e lê os dados — operação atômica.
  const { data: c, error } = await admin
    .from('contatos')
    .update({ notificado_em: new Date().toISOString() })
    .eq('id', id)
    .is('notificado_em', null)
    .select('id, created_at, nome, email, telefone, area, preferencia, mensagem')
    .maybeSingle()

  if (error) { console.error('Erro ao ler contato', id, error); return json({ error: 'db' }, 500) }
  if (!c) return json({ ok: true, skipped: true }) // inexistente ou já notificado

  const quando = new Date(c.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const tel = c.telefone ? String(c.telefone) : ''
  const waNum = tel.replace(/\D/g, '')
  const wa = waNum ? `https://wa.me/${waNum.startsWith('55') ? waNum : '55' + waNum}` : ''

  const linhas: [string, string][] = [
    ['Nome', esc(c.nome)],
    ['Telefone', tel ? `${esc(tel)}${wa ? ` · <a href="${wa}">abrir no WhatsApp</a>` : ''}` : '—'],
    ['E-mail', c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : '—'],
    ['Assunto', esc(c.area)],
    ['Prefere contato por', esc(c.preferencia)],
    ['Recebido em', esc(quando)],
  ]

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#16303C;max-width:560px">
    <h2 style="font-family:Georgia,serif;font-weight:normal;margin:0 0 4px">Novo contato pelo site</h2>
    <div style="width:56px;height:1px;background:#C49C42;margin:12px 0 20px"></div>
    <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
      ${linhas.map(([k, v]) => `<tr><td style="color:#4A5D66;vertical-align:top;white-space:nowrap">${k}</td><td><strong>${v}</strong></td></tr>`).join('')}
    </table>
    <p style="font-size:14px;color:#4A5D66;margin:20px 0 6px">Mensagem:</p>
    <div style="font-size:15px;line-height:1.55;background:#F2F2F0;border-left:2px solid #C49C42;padding:12px 14px;white-space:pre-wrap">${c.mensagem ? esc(c.mensagem) : '<em>(sem mensagem)</em>'}</div>
    <p style="font-size:12px;color:#4A5D66;margin-top:24px">Todas as mensagens ficam no Supabase → Table Editor → contatos.</p>
  </div>`

  const texto = linhas.map(([k, v]) => `${k}: ${v.replace(/<[^>]+>/g, '')}`).join('\n') +
    `\n\nMensagem:\n${c.mensagem ?? '(sem mensagem)'}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: [NOTIFY_TO],
      reply_to: c.email || undefined,
      subject: `Novo contato pelo site: ${c.nome} (${c.area})`,
      html,
      text: texto,
    }),
  })

  if (!res.ok) {
    const detalhe = await res.text()
    console.error('Falha no Resend', res.status, detalhe)
    // Libera para uma nova tentativa
    await admin.from('contatos').update({ notificado_em: null }).eq('id', id)
    return json({ error: 'email', status: res.status }, 502)
  }

  return json({ ok: true })
})
