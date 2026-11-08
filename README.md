# Site · Ayrton Brêda Advocacia

Site estático (HTML + CSS + JS puro, sem build). Para editar textos, abra `index.html`. Os trechos marcados com `<!-- EDITAR -->` são os mais pessoais.

## Estrutura
```
index.html            página única (header, hero, sobre, áreas, como funciona,
                      digital/presencial, FAQ, contato, rodapé)
privacidade.html      política de privacidade (LGPD)
css/style.css         todo o visual (cores no topo, em :root)
js/main.js            menu mobile, fade-in, ano automático (+ espaço comentado p/ analytics)
assets/fonts/         Libre Caslon Text + Inter (hospedadas no próprio site)
assets/img/           foto, monograma recortado e imagem de compartilhamento (og-image.jpg)
assets/*.png          ícones (apple-touch, 192, 512, favicon-32)
favicon.ico, site.webmanifest, robots.txt, sitemap.xml
vercel.json           headers de segurança e cache na Vercel
.vercelignore         arquivos que ficam no GitHub mas não vão para o site
```
Os arquivos originais (`foto-ayrton.jpg.jpg`, `logo-*.png/jpg`) foram mantidos em `assets/`, mas o site não os usa. O `.vercelignore` impede que eles sejam publicados.

## Opções de título do hero
1. **Direito explicado com clareza. Defendido com dedicação.** (em uso)
2. Seu caso, entendido de perto.
3. Você merece entender o seu caso e ser ouvido.

## Trocar o domínio
O domínio previsto é `https://ayrtonbredaadvogado.com.br`. Se for outro, use "localizar e substituir" em `index.html`, `privacidade.html`, `sitemap.xml` e `robots.txt`.

## Publicar na Vercel (em uso)
1. Entre em vercel.com com a sua conta do GitHub.
2. **Add New… → Project** → importe `ayrtonbreda/aula-site-completo-advocacia`.
3. Configure assim:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command / Output Directory / Install Command:** deixe como estão, sem override. O `vercel.json` já define `node scripts/build.js` e a pasta `dist`.
   - **Environment Variables:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (veja "Variáveis de ambiente e build").
4. Clique em **Deploy**. Em cerca de 30 s o site fica no ar em um endereço `….vercel.app`.
5. A partir daí, **cada `git push` na branch `main` publica o site automaticamente**.

### Domínio próprio na Vercel
1. No projeto, vá em **Settings → Domains → Add** e digite `ayrtonbredaadvogado.com.br`. Aceite a sugestão de também adicionar `www`, redirecionando para o domínio principal.
2. No Registro.br, em **DNS → Editar zona**, crie os registros que a Vercel mostrar. Normalmente são:
   - `A` para `ayrtonbredaadvogado.com.br` → `76.76.21.21`
   - `CNAME` para `www` → `cname.vercel-dns.com`

   Se a tela da Vercel mostrar valores diferentes, use os da tela.
3. Aguarde a verificação. O HTTPS é gerado sozinho.

## Publicar no Netlify (alternativa)
1. Crie uma conta em netlify.com.
2. **Sites → Add new site → Deploy manually** e arraste a pasta inteira do site.
   (Ou conecte um repositório do GitHub, para publicar a cada alteração.)
3. **Domain management → Add a domain** → digite `ayrtonbredaadvogado.com.br`.
4. No painel do Registro.br (onde o domínio `.com.br` é registrado), escolha uma das opções:
   - **Opção A (mais simples):** em "DNS", troque os servidores para os *nameservers* que o Netlify mostrar (ex.: `dns1.p0X.nsone.net`…).
   - **Opção B:** mantenha o DNS do Registro.br e crie os registros:
     - `A` para `ayrtonbredaadvogado.com.br` → `75.2.60.5`
     - `CNAME` para `www` → `SEU-SITE.netlify.app`
5. Aguarde a propagação (de minutos a algumas horas). O Netlify gera o HTTPS (Let's Encrypt) sozinho. Ative **Force HTTPS**.

## Publicar no GitHub Pages
1. Crie um repositório (ex.: `site`) e envie todos os arquivos para a branch `main`.
2. **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Em **Custom domain**, digite `ayrtonbredaadvogado.com.br` (isso cria o arquivo `CNAME`).
4. No Registro.br, crie os registros:
   - 4 registros `A` para `ayrtonbredaadvogado.com.br` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` para `www` → `SEU-USUARIO.github.io`
5. Depois que o domínio validar, marque **Enforce HTTPS**.


## Depois de publicar
- **Google Search Console:** adicione o domínio e envie `https://ayrtonbredaadvogado.com.br/sitemap.xml`.
- **Perfil da Empresa no Google:** vale a pena criar um perfil como "área de atendimento" (sem endereço público) para Vitória, Vila Velha e Cariacica.
- **Instagram:** coloque o link do site na bio.
- Para testar a pré-visualização do link, cole a URL em opengraph.xyz ou no próprio WhatsApp.

## Analytics no futuro
Hoje o site não tem cookies. Se quiser GA4 ou Meta Pixel, siga as instruções comentadas em `index.html` (procure "ANALYTICS") e em `js/main.js`. O banner de consentimento já está pronto, só que comentado. Depois, atualize `privacidade.html`.

## Formulário de contato (Supabase)
O formulário da seção "Contato" grava as mensagens na tabela `contatos` do projeto Supabase **"Ayrton Brêda Advogado"**. Não há login: qualquer visitante pode enviar.

**Segurança (testada):**
- Pelo site, o visitante só consegue **inserir** mensagens. Ler, alterar e apagar são bloqueados no banco (RLS e permissões por coluna).
- A URL e a chave vêm das variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Use sempre a **chave publicável** (`sb_publishable_…`), que foi feita para ficar no navegador. O build **recusa** chaves secretas (`sb_secret_…`/`service_role`).
- O banco recusa mensagens sem consentimento ou sem telefone e e-mail, e tem limites de tamanho.
- Contra robôs, há um campo-armadilha invisível e um tempo mínimo de preenchimento.

**Onde ver as mensagens:** Supabase → projeto "Ayrton Brêda Advogado" → **Table Editor → contatos**. A coluna `status` (`novo`, `respondido`, `arquivado`) serve para você organizar o atendimento.

**Arquivos:**
```
js/contato.js                     lógica do formulário (URL e chave publicável no topo)
js/vendor/supabase-2.119.0.js     biblioteca @supabase/supabase-js para o navegador
supabase/migrations/…_contatos.sql  SQL que criou a tabela (histórico)
package.json / package-lock.json  versões fixas das bibliotecas
scripts/vendor-supabase.js        copia a biblioteca de node_modules para js/vendor
```

**Atualizar a biblioteca do Supabase:**
1. Em `package.json`, troque a versão de `@supabase/supabase-js`.
2. Rode `npm install` e depois `npm run vendor`.
3. Em `js/contato.js`, atualize `SUPABASE_LIB` com o novo nome do arquivo.


## Variáveis de ambiente e build
O site precisa de duas variáveis, com valores tirados do Supabase (Project Settings → API Keys / Data API):

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |

- **No computador:** ficam no arquivo `.env`, que **não** vai para o GitHub. O modelo é o `.env.example`.
- **Na Vercel:** ficam em **Settings → Environment Variables**, marcadas para *Production* e *Preview*.

O comando `npm run build` (que a Vercel roda sozinha a cada deploy) copia o site para `dist/` e gera `dist/js/config.js` com essas variáveis. Se alguma faltar, o build **falha de propósito** e o site no ar continua na versão anterior, sem quebrar.

Para testar localmente: rode `npm run build` e sirva a pasta `dist/` em um servidor local.

## Aviso por e-mail a cada novo contato
Quando alguém envia o formulário, o banco dispara um gatilho que chama a Edge Function `notificar-contato`. Ela envia um e-mail pelo **Resend** para `adv.ayrtonbreda@gmail.com`, com nome, telefone (e link do WhatsApp), e-mail, assunto e mensagem. Responder o e-mail já responde à pessoa (*reply-to*).

**Configuração (uma vez):**
1. Crie uma conta grátis em resend.com **com o e-mail adv.ayrtonbreda@gmail.com**.
2. Em Resend → **API Keys → Create API Key** (permissão *Sending access*). Copie a chave (`re_…`).
3. Em Supabase → projeto → **Edge Functions → Secrets → Add new secret**: nome `RESEND_API_KEY`, valor = a chave. Não precisa republicar nada.

**Opcional, para enviar de um endereço do seu domínio** (ex.: `site@ayrtonbredaadvogado.com.br`) e para outros destinatários:
- Verifique o domínio em Resend → **Domains** (registros DNS na Vercel/Registro.br).
- Crie os secrets `NOTIFY_FROM` (ex.: `Site Ayrton Brêda <site@ayrtonbredaadvogado.com.br>`) e, se quiser, `NOTIFY_TO`.
- Sem domínio verificado, o Resend só entrega para o e-mail dono da conta, que é exatamente o caso aqui.

**Se um aviso falhar:** a mensagem continua salva no banco, e a coluna `notificado_em` fica vazia. Os erros aparecem em Supabase → Edge Functions → notificar-contato → **Logs**.

**Arquivos:** `supabase/functions/notificar-contato/index.ts` (função), `supabase/migrations/…_notificar_contato_por_email.sql` (gatilho) e `supabase/config.toml`.
