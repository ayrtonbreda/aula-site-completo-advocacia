-- Aplicada no projeto Supabase "Ayrton Brêda Advogado" (wrxpekndmdhddkrwocwy) em 2026-11-08.
-- Aviso por e-mail a cada nova mensagem do formulário.
-- O gatilho chama a Edge Function "notificar-contato" (via pg_net, assíncrono),
-- enviando apenas o id; a função lê os dados com a chave secreta e envia o e-mail.

create extension if not exists pg_net with schema extensions;

alter table public.contatos add column if not exists notificado_em timestamptz;
comment on column public.contatos.notificado_em is 'Quando o aviso por e-mail foi enviado (null = ainda não enviado).';

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.notificar_novo_contato()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://wrxpekndmdhddkrwocwy.supabase.co/functions/v1/notificar-contato',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('id', new.id),
    timeout_milliseconds := 10000
  );
  return new;
end;
$$;

revoke all on function private.notificar_novo_contato() from public, anon, authenticated;

create trigger contatos_notificar_email
  after insert on public.contatos
  for each row execute function private.notificar_novo_contato();
