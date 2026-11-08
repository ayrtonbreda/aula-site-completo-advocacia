-- Aplicada no projeto Supabase "Ayrton Brêda Advogado" (wrxpekndmdhddkrwocwy) em 2026-11-08.
-- Mensagens enviadas pelo formulário de contato do site.
-- Visitantes (role anon) podem apenas INSERIR; ninguém de fora pode ler, alterar ou apagar.
create table public.contatos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nome          text not null check (char_length(btrim(nome)) between 2 and 120),
  email         text check (email is null or (char_length(email) <= 160 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  telefone      text check (telefone is null or char_length(telefone) between 8 and 30),
  area          text not null default 'Outro'
                check (area in ('Trabalhista', 'Previdenciário', 'Cível e Consumidor', 'Direito Bancário', 'Outro')),
  preferencia   text not null default 'WhatsApp'
                check (preferencia in ('WhatsApp', 'E-mail', 'Ligação')),
  mensagem      text check (mensagem is null or char_length(mensagem) <= 2000),
  consentimento boolean not null check (consentimento = true),
  status        text not null default 'novo' check (status in ('novo', 'respondido', 'arquivado')),
  constraint contatos_email_ou_telefone check (email is not null or telefone is not null)
);

comment on table public.contatos is 'Mensagens do formulário de contato do site (LGPD: dados de contato fornecidos com consentimento).';

create index contatos_created_at_idx on public.contatos (created_at desc);

alter table public.contatos enable row level security;

-- Remove qualquer privilégio padrão e concede apenas INSERT nas colunas que o site envia.
revoke all on table public.contatos from anon, authenticated;
grant insert (nome, email, telefone, area, preferencia, mensagem, consentimento) on table public.contatos to anon;

create policy "Visitantes podem enviar mensagens"
  on public.contatos
  for insert
  to anon
  with check (consentimento = true and status = 'novo');
