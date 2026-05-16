const WHATSAPP_NUMERO = "5511998133317";

let todosOsProdutos = [];
const carrinho = new Map(); // sku → {produto, qtde}
let popupSku = null;

// ── Carregar dados ──────────────────────────────────────────────────────────

async function carregarProdutos() {
  const resp = await fetch("produtos.json");
  todosOsProdutos = await resp.json();
  renderCategorias();
  renderDestaques();
  renderProdutos(todosOsProdutos);
}

// ── Categorias e filtro ─────────────────────────────────────────────────────

function renderCategorias() {
  const cats = ["Todos", ...new Set(
    todosOsProdutos.map(p => p.categoria).filter(Boolean).sort()
  )];
  const container = document.getElementById("categorias");
  container.innerHTML = cats.map(c => `
    <button class="chip ${c === "Todos" ? "ativo" : ""}" data-cat="${c}">${c}</button>
  `).join("");
  container.addEventListener("click", e => {
    if (!e.target.matches(".chip")) return;
    container.querySelectorAll(".chip").forEach(b => b.classList.remove("ativo"));
    e.target.classList.add("ativo");
    filtrar();
  });
}

function filtrar() {
  const cat = document.querySelector(".chip.ativo")?.dataset.cat ?? "Todos";
  const busca = document.getElementById("busca").value.toLowerCase().trim();
  const resultado = todosOsProdutos.filter(p => {
    const matchCat = cat === "Todos" || p.categoria === cat;
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca);
    return matchCat && matchBusca;
  });
  renderProdutos(resultado);
}

// ── Destaques (scroll horizontal) ──────────────────────────────────────────

function renderDestaques() {
  const lista = todosOsProdutos.filter(p => p.destaque && !p.esgotado);
  if (!lista.length) return;
  const secao = document.getElementById("secao-destaques");
  const scroll = document.getElementById("destaques-scroll");
  secao.style.display = "block";
  scroll.innerHTML = lista.map(p => cardDestaqueHtml(p)).join("");
}

function cardDestaqueHtml(p) {
  const item = carrinho.get(p.sku);
  return `
  <div class="card-destaque-wrap" data-sku="${p.sku}">
    <div class="card-destaque-img">
      ${p.imagem_url
        ? `<img src="${p.imagem_url}" alt="${escHtml(p.nome)}" loading="lazy">`
        : `<div class="sem-foto">🔩</div>`}
    </div>
    <p class="cd-nome">${escHtml(p.nome)}</p>
    <p class="cd-preco">R$ ${formatPreco(p.meu_preco)}</p>
    ${item
      ? `<div class="inline-qtde cd-inline">
           <button onclick="inlineQtde('${p.sku}',-1)">−</button>
           <span>${item.qtde}</span>
           <button onclick="inlineQtde('${p.sku}',+1)">+</button>
         </div>`
      : `<button class="btn-comprar-card cd-btn" onclick="abrirPopup('${p.sku}')">Adicionar</button>`
    }
  </div>`;
}

// ── Grid de produtos ────────────────────────────────────────────────────────

function renderProdutos(lista) {
  const grid = document.getElementById("grid");
  if (!lista.length) {
    grid.innerHTML = '<p class="vazio">Nenhum produto encontrado.</p>';
    return;
  }
  grid.innerHTML = lista.map(p => cardGridHtml(p)).join("");
}

function cardGridHtml(p) {
  const item = carrinho.get(p.sku);
  return `
  <div class="card ${p.esgotado ? "esgotado" : ""}" data-sku="${p.sku}">
    <div class="card-img-wrap">
      ${p.imagem_url
        ? `<img src="${p.imagem_url}" alt="${escHtml(p.nome)}" loading="lazy">`
        : `<div class="sem-foto">🔩</div>`}
      ${p.esgotado ? '<span class="tag-esgotado">Esgotado</span>' : ""}
    </div>
    <div class="card-info">
      <p class="card-nome">${escHtml(p.nome)}</p>
      ${p.categoria ? `<span class="card-cat">${escHtml(p.categoria)}</span>` : ""}
      <p class="card-preco">R$ ${formatPreco(p.meu_preco)}</p>
      ${p.esgotado
        ? `<button class="btn-comprar-card disabled" disabled>Indisponível</button>`
        : item
          ? `<div class="inline-qtde">
               <button onclick="inlineQtde('${p.sku}',-1)">−</button>
               <span>${item.qtde}</span>
               <button onclick="inlineQtde('${p.sku}',+1)">+</button>
             </div>`
          : `<button class="btn-comprar-card" onclick="abrirPopup('${p.sku}')">Adicionar</button>`
      }
    </div>
  </div>`;
}

// ── Popup "Adicionar ao carrinho" ───────────────────────────────────────────

function abrirPopup(sku) {
  const produto = todosOsProdutos.find(p => p.sku === sku);
  if (!produto) return;
  popupSku = sku;

  const qtdeInicial = carrinho.get(sku)?.qtde ?? 1;
  document.getElementById("popup-qtde").textContent = qtdeInicial;

  const img = document.getElementById("popup-img");
  img.src = produto.imagem_url || "";
  img.style.display = produto.imagem_url ? "block" : "none";

  document.getElementById("popup-nome").textContent = produto.nome;
  document.getElementById("popup-preco").textContent = `R$ ${formatPreco(produto.meu_preco)}`;

  document.getElementById("popup-produto").classList.add("aberto");
  document.getElementById("overlay").classList.add("ativo");
}

function fecharPopup() {
  document.getElementById("popup-produto").classList.remove("aberto");
  document.getElementById("overlay").classList.remove("ativo");
  popupSku = null;
}

function popupDelta(delta) {
  const el = document.getElementById("popup-qtde");
  const atual = parseInt(el.textContent);
  el.textContent = Math.max(1, atual + delta);
}

function popupConfirmar(acao) {
  if (!popupSku) return;
  const produto = todosOsProdutos.find(p => p.sku === popupSku);
  const qtde = parseInt(document.getElementById("popup-qtde").textContent);

  if (carrinho.has(popupSku)) {
    carrinho.get(popupSku).qtde = qtde;
  } else {
    carrinho.set(popupSku, { produto, qtde });
  }

  const sku = popupSku;
  fecharPopup();
  atualizarCardUI(sku);
  atualizarFab();

  if (acao === "carrinho") {
    abrirCarrinho();
  }
}

// ── Controles inline de quantidade no card ──────────────────────────────────

function inlineQtde(sku, delta) {
  const item = carrinho.get(sku);
  if (!item) return;
  item.qtde = item.qtde + delta;
  if (item.qtde <= 0) {
    carrinho.delete(sku);
  }
  atualizarCardUI(sku);
  atualizarFab();
  if (carrinho.has(sku)) {
    renderCarrinho();
  }
}

function atualizarCardUI(sku) {
  const produto = todosOsProdutos.find(p => p.sku === sku);
  if (!produto) return;
  const item = carrinho.get(sku);

  const card = document.querySelector(`#grid .card[data-sku="${sku}"]`);
  if (card) {
    const info = card.querySelector(".card-info");
    const btnOuCtrl = info.querySelector(".btn-comprar-card, .inline-qtde");
    if (btnOuCtrl) {
      if (item) {
        btnOuCtrl.outerHTML = `<div class="inline-qtde">
          <button onclick="inlineQtde('${sku}',-1)">−</button>
          <span>${item.qtde}</span>
          <button onclick="inlineQtde('${sku}',+1)">+</button>
        </div>`;
      } else {
        btnOuCtrl.outerHTML = `<button class="btn-comprar-card" onclick="abrirPopup('${sku}')">Adicionar</button>`;
      }
    }
  }

  const cd = document.querySelector(`#destaques-scroll .card-destaque-wrap[data-sku="${sku}"]`);
  if (cd) {
    const btnOuCtrl = cd.querySelector(".cd-btn, .cd-inline");
    if (btnOuCtrl) {
      if (item) {
        btnOuCtrl.outerHTML = `<div class="inline-qtde cd-inline">
          <button onclick="inlineQtde('${sku}',-1)">−</button>
          <span>${item.qtde}</span>
          <button onclick="inlineQtde('${sku}',+1)">+</button>
        </div>`;
      } else {
        btnOuCtrl.outerHTML = `<button class="btn-comprar-card cd-btn" onclick="abrirPopup('${sku}')">Adicionar</button>`;
      }
    }
  }
}

// ── FAB ─────────────────────────────────────────────────────────────────────

function atualizarFab() {
  const total = [...carrinho.values()].reduce((s, i) => s + i.qtde, 0);
  const fab = document.getElementById("fab-carrinho");
  const badge = document.getElementById("fab-badge");
  const navBtn = document.getElementById("nav-cart-btn");
  const navBadge = document.getElementById("nav-cart-badge");
  badge.textContent = total;
  navBadge.textContent = total;
  fab.style.display = total > 0 ? "flex" : "none";
  navBtn.style.display = total > 0 ? "flex" : "none";
}

// ── Painel do carrinho ──────────────────────────────────────────────────────

function abrirCarrinho() {
  renderCarrinho();
  document.getElementById("painel-carrinho").classList.add("aberto");
  document.getElementById("overlay").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("painel-carrinho").classList.remove("aberto");
  document.getElementById("overlay").classList.remove("ativo");
}

function renderCarrinho() {
  const lista = document.getElementById("carrinho-lista");
  const rodape = document.getElementById("carrinho-rodape");

  if (carrinho.size === 0) {
    lista.innerHTML = '<p class="carrinho-vazio">Nenhum item adicionado.</p>';
    rodape.innerHTML = "";
    return;
  }

  const itens = [...carrinho.values()];
  const totalGeral = itens.reduce((s, i) => s + i.produto.meu_preco * i.qtde, 0);

  lista.innerHTML = itens.map(({ produto, qtde }) => `
    <div class="carrinho-item">
      <div class="ci-img">
        ${produto.imagem_url
          ? `<img src="${produto.imagem_url}" alt="${escHtml(produto.nome)}">`
          : `<div class="ci-sem-foto">🔩</div>`}
      </div>
      <div class="ci-info">
        <p class="ci-nome">${escHtml(produto.nome)}</p>
        <p class="ci-preco">R$ ${formatPreco(produto.meu_preco)}</p>
        <div class="ci-qtde">
          <button onclick="setQtdeCarrinho('${produto.sku}', -1)">−</button>
          <span>${qtde}</span>
          <button onclick="setQtdeCarrinho('${produto.sku}', +1)">+</button>
          <button class="ci-remover" onclick="removerDoCarrinho('${produto.sku}')">🗑</button>
        </div>
      </div>
      <p class="ci-subtotal">R$ ${formatPreco(produto.meu_preco * qtde)}</p>
    </div>
  `).join("");

  rodape.innerHTML = `
    <div class="carrinho-total">
      <span>Total</span>
      <strong>R$ ${formatPreco(totalGeral)}</strong>
    </div>
    <a class="btn-pedido" href="${whatsappUrlCarrinho(itens, totalGeral)}" target="_blank" rel="noopener" onclick="fecharCarrinho()">
      Enviar pedido no WhatsApp
    </a>
    <button class="btn-limpar" onclick="limparCarrinho()">Limpar carrinho</button>
  `;
}

function setQtdeCarrinho(sku, delta) {
  const item = carrinho.get(sku);
  if (!item) return;
  item.qtde = Math.max(1, item.qtde + delta);
  renderCarrinho();
  atualizarFab();
  atualizarCardUI(sku);
}

function removerDoCarrinho(sku) {
  carrinho.delete(sku);
  atualizarCardUI(sku);
  atualizarFab();
  renderCarrinho();
}

function limparCarrinho() {
  const skus = [...carrinho.keys()];
  carrinho.clear();
  skus.forEach(sku => atualizarCardUI(sku));
  atualizarFab();
  fecharCarrinho();
}

// ── WhatsApp ────────────────────────────────────────────────────────────────

function whatsappUrlCarrinho(itens, total) {
  const linhas = itens.map(({ produto, qtde }) => {
    const sub = formatPreco(produto.meu_preco * qtde);
    return qtde > 1
      ? `• ${produto.nome} (x${qtde}) — R$ ${sub}`
      : `• ${produto.nome} — R$ ${formatPreco(produto.meu_preco)}`;
  }).join("\n");
  const msg = `Olá! Gostaria de fazer um pedido:\n\n${linhas}\n\n*Total: R$ ${formatPreco(total)}*\n\nAguardo confirmação e dados para pagamento!`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
}

// ── Utilitários ─────────────────────────────────────────────────────────────

function formatPreco(v) {
  return Number(v).toFixed(2).replace(".", ",");
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.getElementById("busca").addEventListener("input", filtrar);
document.getElementById("overlay").addEventListener("click", () => {
  fecharPopup();
  fecharCarrinho();
});
carregarProdutos();

// ── Tema ─────────────────────────────────────────────────────────────────────

function alternarTema() {
  const html = document.documentElement;
  const novo = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", novo);
  localStorage.setItem("tema", novo);
  _atualizarIconeTema(novo);
}

function _atualizarIconeTema(tema) {
  const icon = document.querySelector(".theme-icon");
  if (icon) icon.textContent = tema === "light" ? "🌙" : "☀️";
}

_atualizarIconeTema(document.documentElement.getAttribute("data-theme") || "light");
