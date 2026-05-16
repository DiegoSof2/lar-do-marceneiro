# Lar do Marceneiro — Catálogo MVP

Catálogo online estático para o Lar do Marceneiro, baseado na mesma estrutura do projeto `milnotas_perfumes`. Pedidos fechados via WhatsApp com pagamento via Pix.

**Loja original:** https://www.lardomarceneiro.com.br/
**WhatsApp:** +55 11 94671-7586

## Site Estático (MVP)

Localizado em `site/`. Exibe 30 produtos de 6 categorias (Ferragens, Dobradiças, Corrediças, Cozinha, Elétrica, Puxadores) com imagens hospedadas no CDN da Tiendanube.

### Como rodar localmente

```bash
cd site && python -m http.server 8000
```

Abrir em http://localhost:8000

### Estrutura

```
site/
├── index.html       # Página principal
├── style.css        # Design tokens — paleta madeira/âmbar
├── app.js           # Lógica: filtros, carrinho, WhatsApp
└── produtos.json    # 30 produtos estáticos (MVP)
```

### Identidade visual

- **Fonte:** Montserrat (Google Fonts)
- **Cores light:** marrom `#6D4C28`, âmbar `#C17F24`, fundo `#FAF6F0`
- **Cores dark:** âmbar `#D4950A`, marrom `#8B5E3C`, fundo `#141008`
- **Padrão default:** modo claro (mais adequado para ferragens)

### Produtos

30 itens distribuídos em 6 categorias, scraped do site original em 2026-05-16. SKUs no formato `ldm-001` a `ldm-030`. Imagens servidas do CDN Tiendanube (acdn-us.mitiendanube.com).

Para adicionar/editar produtos: editar `site/produtos.json` diretamente.

### Campos do produto (produtos.json)

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

- `esgotado: 1` → aparece com tag "Esgotado" e botão desabilitado
- `destaque: true` → aparece na seção horizontal de destaques no topo

### Próximos passos sugeridos

- [ ] Adicionar scraper Python similar ao do milnotas_perfumes para sincronizar com a API/site Tiendanube
- [ ] Deploy no GitHub Pages ou Cloudflare Pages
- [ ] Adicionar logo real do Lar do Marceneiro
- [ ] Automatizar atualização do produtos.json via cron/GitHub Actions
