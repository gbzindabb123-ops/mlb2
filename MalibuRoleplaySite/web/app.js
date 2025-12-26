// ===== Malibu Roleplay Config =====
const DISCORD_INVITE_URL = ""; // ex: "https://discord.gg/SEULINK"
const CONNECT_CMD = ""; // quando tiver IP: "connect SEU_IP_AQUI:30120"
const BACKEND_BASE_URL = "http://localhost:3001";

// ===== SPA navigation =====
const pages = ["home","store","rules","team","checkout"];

// ===== Products (edit as needed) =====
const productsData = [
  { id:"vip_malibu", name:"VIP Malibu (30 dias)", price: 39.90, tag:"VIP", desc:"Prioridade + bônus de salário + perks exclusivos." },
  { id:"vip_platinum", name:"VIP Platinum (30 dias)", price: 79.90, tag:"VIP", desc:"Prioridade alta + benefícios premium + fila turbo." },
  { id:"coins_50k", name:"50.000 Créditos", price: 19.90, tag:"Créditos", desc:"Créditos para economia do servidor." },
  { id:"coins_150k", name:"150.000 Créditos", price: 39.90, tag:"Créditos", desc:"Evolua mais rápido com compra segura." },
  { id:"garagem_premium", name:"Garagem Premium (30 dias)", price: 49.90, tag:"Utilidade", desc:"Slots extras + benefícios de garagem." },
  { id:"pack_custom", name:"Pacote Custom (skin/veículo)", price: 119.90, tag:"Custom", desc:"Entrega via whitelist/aprovação da staff." },
];

// ===== Team =====
const teamData = [
  { name:"AQUILES", role:"Fundador • Malibu Roleplay", bio:"Direção do projeto, decisões finais e visão do RP.", links:[["Discord","#"],["Instagram","#"]] },
  { name:"AnNy", role:"Fundadora • Malibu Roleplay", bio:"Administração geral, organização e padronização das regras e experiência do RP.", links:[["Discord","#"],["Instagram","#"]] },
  { name:"VT", role:"Programador • Malibu Roleplay", bio:"Desenvolvimento de scripts, estabilidade, otimização e segurança do servidor.", links:[["Discord","#"],["Instagram","#"]] },
];

const cart = new Map(); // id -> qty
const fmtBRL = (v) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function setPage(page){
  pages.forEach(p=>{
    document.getElementById(`page-${p}`).classList.toggle("show", p===page);
  });
  document.querySelectorAll(".nav-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.page===page);
  });
  window.scrollTo({top:0, behavior:"smooth"});
}

function cartCount(){
  let n = 0;
  for (const qty of cart.values()) n += qty;
  return n;
}
function cartTotal(){
  let total = 0;
  for (const [id, qty] of cart.entries()){
    const p = productsData.find(x=>x.id===id);
    total += (p?.price || 0) * qty;
  }
  return total;
}

function renderCart(){
  document.getElementById("cartCount").textContent = cartCount();
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  totalEl.textContent = fmtBRL(cartTotal());

  if (cartCount() === 0){
    box.innerHTML = `<div class="muted">Seu carrinho está vazio. Vá na Loja e adicione produtos.</div>`;
    return;
  }

  box.innerHTML = "";
  for (const [id, qty] of cart.entries()){
    const p = productsData.find(x=>x.id===id);
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="left">
        <div class="title">${p.name}</div>
        <div class="sub">${qty} × ${fmtBRL(p.price)} • <span class="muted">${p.tag}</span></div>
      </div>
      <div class="actions">
        <button data-act="dec" data-id="${id}">-</button>
        <strong>${qty}</strong>
        <button data-act="inc" data-id="${id}">+</button>
        <button data-act="del" data-id="${id}">Remover</button>
      </div>
    `;
    box.appendChild(row);
  }

  box.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      if (act==="inc") cart.set(id, (cart.get(id)||0)+1);
      if (act==="dec") cart.set(id, Math.max(1, (cart.get(id)||1)-1));
      if (act==="del") cart.delete(id);
      renderCart();
      renderProducts(document.getElementById("searchInput")?.value || "");
    });
  });
}

function renderProducts(filter=""){
  const wrap = document.getElementById("products");
  wrap.innerHTML = "";
  const q = filter.trim().toLowerCase();

  const items = productsData.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
  );

  items.forEach(p=>{
    const el = document.createElement("div");
    el.className = "prod";
    const qty = cart.get(p.id) || 0;

    el.innerHTML = `
      <span class="badge">${p.tag}</span>
      <div class="name">${p.name}</div>
      <div class="muted small">${p.desc}</div>
      <div class="row">
        <div>
          <div class="price">${fmtBRL(p.price)}</div>
          <div class="muted small">Entrega após confirmação</div>
        </div>
        <div class="qty">
          <button data-act="dec">-</button>
          <span>${qty}</span>
          <button data-act="inc">+</button>
        </div>
      </div>
    `;

    const buttons = el.querySelectorAll("button");
    const bDec = buttons[0];
    const bInc = buttons[1];

    bDec.addEventListener("click", ()=>{
      if (!cart.has(p.id)) return;
      const n = cart.get(p.id);
      if (n<=1) cart.delete(p.id); else cart.set(p.id, n-1);
      renderProducts(document.getElementById("searchInput").value);
      renderCart();
    });
    bInc.addEventListener("click", ()=>{
      cart.set(p.id, (cart.get(p.id)||0)+1);
      renderProducts(document.getElementById("searchInput").value);
      renderCart();
    });

    wrap.appendChild(el);
  });
}

function renderTeam(){
  const wrap = document.getElementById("teamCards");
  wrap.innerHTML = "";
  teamData.forEach((m)=>{
    const el = document.createElement("div");
    el.className = "member";
    el.innerHTML = `
      <div class="avatar">${m.name.slice(0,1).toUpperCase()}</div>
      <div class="name">${m.name}</div>
      <div class="role">${m.role}</div>
      <div class="bio">${m.bio}</div>
      <div class="links">
        ${m.links.map(l=>`<a href="${l[1]}" target="_blank" rel="noopener">${l[0]}</a>`).join("")}
      </div>
    `;
    wrap.appendChild(el);
  });
}

function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 3400);
}

/** Checkout: chama o backend para criar pagamento */
async function payNow(){
  if (cartCount()===0) return toast("Carrinho vazio. Adicione itens na Loja.");
  const name = document.getElementById("buyerName").value.trim();
  const email = document.getElementById("buyerEmail").value.trim();
  if (!name || !email) return toast("Preencha nome e e-mail.");

  const payMethod = document.querySelector("input[name='pay']:checked").value;

  const items = [];
  for (const [id, qty] of cart.entries()){
    const p = productsData.find(x=>x.id===id);
    items.push({ id, title:p.name, unit_price:p.price, quantity:qty });
  }

  try{
    if (payMethod === "mp"){
      const res = await fetch(`${BACKEND_BASE_URL}/api/mercadopago/create-preference`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ buyer:{name,email}, items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha no Mercado Pago");
      window.location.href = data.init_point;
      return;
    }

    if (payMethod === "paypal"){
      const res = await fetch(`${BACKEND_BASE_URL}/api/paypal/create-order`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ buyer:{name,email}, items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha no PayPal");
      window.location.href = data.approve_url;
      return;
    }

  }catch(err){
    toast(err.message || "Erro ao iniciar pagamento.");
  }
}

// ===== Discord modal helpers =====
function openDiscordModal(){
  const modal = document.getElementById("discordModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  const inviteText = document.getElementById("discordInviteText");
  inviteText.textContent = DISCORD_INVITE_URL ? DISCORD_INVITE_URL : "Ainda não definido";
}
function closeDiscordModal(){
  const modal = document.getElementById("discordModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

// ===== Init =====
document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const page = btn.dataset.page;
    if (page) {
      setPage(page);
      renderCart();
    }
  });
});

document.getElementById("btnGoStore").addEventListener("click",(e)=>{e.preventDefault(); setPage("store");});
document.getElementById("btnGoStore2").addEventListener("click",(e)=>{e.preventDefault(); setPage("store");});

document.getElementById("btnCopyIP").addEventListener("click",(e)=>{
  e.preventDefault();
  if (!CONNECT_CMD){
    toast("IP ainda não definido. Assim que tiver, eu coloco o connect aqui.");
    return;
  }
  navigator.clipboard.writeText(CONNECT_CMD);
  toast(`Connect copiado: ${CONNECT_CMD}`);
});

document.getElementById("btnClearCart").addEventListener("click", ()=>{
  cart.clear();
  renderProducts(document.getElementById("searchInput").value);
  renderCart();
});

document.getElementById("btnPay").addEventListener("click", payNow);

document.getElementById("searchInput").addEventListener("input",(e)=>{
  renderProducts(e.target.value);
});

renderProducts("");
renderTeam();
renderCart();

// Discord: navbar + floating open modal
document.getElementById("btnDiscord").addEventListener("click", openDiscordModal);
document.getElementById("btnDiscordFloat").addEventListener("click", openDiscordModal);
document.getElementById("discordClose").addEventListener("click", closeDiscordModal);

document.getElementById("discordModal").addEventListener("click", (e)=>{
  const close = e.target?.dataset?.close;
  if (close) closeDiscordModal();
});

document.getElementById("btnCopyDiscord").addEventListener("click", async ()=>{
  if (!DISCORD_INVITE_URL){
    toast("Discord ainda não definido. Me envie o link do convite.");
    return;
  }
  await navigator.clipboard.writeText(DISCORD_INVITE_URL);
  toast("Convite do Discord copiado!");
});

document.getElementById("btnOpenDiscord").addEventListener("click", ()=>{
  if (!DISCORD_INVITE_URL){
    toast("Discord ainda não definido. Me envie o link do convite.");
    return;
  }
  window.open(DISCORD_INVITE_URL, "_blank");
});
