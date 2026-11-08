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
favicon.ico, site.webmanifest, robots.txt, sitemap.xml, netlify.toml
```
Os arquivos originais (`foto-ayrton.jpg.jpg`, `logo-*.png/jpg`) foram mantidos em `assets/`, mas o site não os usa. Antes de publicar, você pode tirá-los dali e guardar em outro lugar.

## Opções de título do hero
1. **Direito explicado com clareza. Defendido com dedicação.** (em uso)
2. Seu caso, entendido de perto.
3. Você merece entender o seu caso e ser ouvido.

## Trocar o domínio
O domínio previsto é `https://ayrtonbreda.adv.br`. Se for outro, use "localizar e substituir" em `index.html`, `privacidade.html`, `sitemap.xml` e `robots.txt`.

## Publicar no Netlify (recomendado)
1. Crie uma conta em netlify.com.
2. **Sites → Add new site → Deploy manually** e arraste a pasta inteira do site.
   (Ou conecte um repositório do GitHub, para publicar a cada alteração.)
3. **Domain management → Add a domain** → digite `ayrtonbreda.adv.br`.
4. No painel do Registro.br (onde o `.adv.br` é registrado), escolha uma das opções:
   - **Opção A (mais simples):** em "DNS", troque os servidores para os *nameservers* que o Netlify mostrar (ex.: `dns1.p0X.nsone.net`…).
   - **Opção B:** mantenha o DNS do Registro.br e crie os registros:
     - `A` para `ayrtonbreda.adv.br` → `75.2.60.5`
     - `CNAME` para `www` → `SEU-SITE.netlify.app`
5. Aguarde a propagação (de minutos a algumas horas). O Netlify gera o HTTPS (Let's Encrypt) sozinho. Ative **Force HTTPS**.

## Publicar no GitHub Pages
1. Crie um repositório (ex.: `site`) e envie todos os arquivos para a branch `main`.
2. **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Em **Custom domain**, digite `ayrtonbreda.adv.br` (isso cria o arquivo `CNAME`).
4. No Registro.br, crie os registros:
   - 4 registros `A` para `ayrtonbreda.adv.br` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` para `www` → `SEU-USUARIO.github.io`
5. Depois que o domínio validar, marque **Enforce HTTPS**.

> Observação: o `.adv.br` é exclusivo para advogados, e o registro exige o CPF de quem tem inscrição na OAB.

## Depois de publicar
- **Google Search Console:** adicione o domínio e envie `https://ayrtonbreda.adv.br/sitemap.xml`.
- **Perfil da Empresa no Google:** vale a pena criar um perfil como "área de atendimento" (sem endereço público) para Vitória, Vila Velha e Cariacica.
- **Instagram:** coloque o link do site na bio.
- Para testar a pré-visualização do link, cole a URL em opengraph.xyz ou no próprio WhatsApp.

## Analytics no futuro
Hoje o site não tem cookies. Se quiser GA4 ou Meta Pixel, siga as instruções comentadas em `index.html` (procure "ANALYTICS") e em `js/main.js`. O banner de consentimento já está pronto, só que comentado. Depois, atualize `privacidade.html`.
