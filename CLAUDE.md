# CLAUDE.md

## Commits

Nunca incluir linha `Co-Authored-By` em commits.

## Sobre o Projeto

Catálogo online estático para o **Lar do Marceneiro** — loja de ferragens e acessórios para marcenaria. O catálogo exibe produtos com preço e disponibilidade. O cliente monta um carrinho e o pedido é enviado diretamente pelo WhatsApp do lojista.

**Loja oficial:** https://www.lardomarceneiro.com.br/ (Tiendanube/Nuvemshop)
**Repositório:** https://github.com/DiegoSof2/lar-do-marceneiro
**Deploy:** Cloudflare Pages (branch `main` → pasta `site/`)
**WhatsApp do lojista:** 5511998133317

## Funcionalidade Principal: Catálogo com Geração de Pedido

O site lê `site/produtos.json` e renderiza um grid de produtos. O cliente:
1. Adiciona itens ao carrinho (controle de quantidade por produto)
2. Abre o painel do carrinho
3. Clica em "Enviar pedido no WhatsApp" → abre `wa.me` com mensagem formatada listando itens, quantidades e total

Não há checkout, pagamento online nem cadastro. O pedido é fechado manualmente via WhatsApp com Pix.

## Estrutura

```
site/
├── index.html       # Página única — navbar, busca, categorias, grid, carrinho
├── style.css        # Design tokens: vermelho #CC1F1F + preto/branco (cores da marca)
├── app.js           # Lógica: fetch produtos.json, filtros, carrinho, URL WhatsApp
├── produtos.json    # 30 produtos estáticos (MVP) — atualizar manualmente ou via script
├── logo.png         # Logo oficial Lar do Marceneiro
└── wrangler.jsonc   # Config Cloudflare Workers/Pages
```

## Dados dos Produtos (produtos.json)

MVP com 30 itens scraped em 2026-05-16 do site oficial. SKUs no formato `ldm-001..ldm-030`.
Categorias: Ferragens, Dobradiças, Corrediças, Cozinha, Elétrica, Puxadores.

Estrutura de cada item:
```json
{
  "sku": "ldm-001",
  "nome": "Nome do produto",
  "categoria": "Ferragens",
  "imagem_url": "https://...",
  "meu_preco": 9.60,
  "esgotado": 0,
  "destaque": false
}
```

- `esgotado: 1` → card acinzentado, botão desabilitado
- `destaque: true` → aparece na faixa horizontal de destaques no topo

## Quando for fazer de verdade

O plano é puxar dados diretamente da API do e-commerce oficial (Tiendanube) — mesma abordagem do projeto `milnotas_perfumes` que consome a API do Vendizap. O `produtos.json` passará a ser gerado por um scraper/script Python em vez de ser editado manualmente.

## Deploy

```bash
# Publicar manualmente via Wrangler
cd site && npx wrangler deploy

# Deploy automático
# Qualquer push na branch main dispara rebuild no Cloudflare Pages
git push origin main
```
