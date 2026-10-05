const products = [
  {id:1,name:"Oversized Wool Coat",category:"dames",price:149.95,color:"#5b554e",tag:"Nieuw"},
  {id:2,name:"Essential Knit Sweater",category:"heren",price:79.95,color:"#b7aa99",tag:"Bestseller"},
  {id:3,name:"Relaxed Tailored Pants",category:"dames",price:89.95,color:"#30302f",tag:""},
  {id:4,name:"Minimal Leather Bag",category:"accessoires",price:119.95,color:"#6d4c3d",tag:"Nieuw"},
  {id:5,name:"Heavyweight Hoodie",category:"heren",price:69.95,color:"#7a7b78",tag:""},
  {id:6,name:"Ribbed Longsleeve",category:"dames",price:49.95,color:"#d5c5b6",tag:""},
  {id:7,name:"Classic Overshirt",category:"heren",price:99.95,color:"#4d514c",tag:"Bestseller"},
  {id:8,name:"Statement Sunglasses",category:"accessoires",price:59.95,color:"#222",tag:"Nieuw"}
];

let cart = JSON.parse(localStorage.getItem("luxewear-cart") || "[]");

const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const backdrop = document.getElementById("backdrop");
const toast = document.getElementById("toast");

const euro = value => new Intl.NumberFormat("nl-NL", {style:"currency", currency:"EUR"}).format(value);

function renderProducts(category="all") {
  const visible = category === "all" ? products : products.filter(p => p.category === category);
  productGrid.innerHTML = visible.map(p => `
    <article class="product-card">
      <div class="product-image" style="--product-color:${p.color}">
        ${p.tag ? `<span>${p.tag}</span>` : ""}
      </div>
      <div class="product-info">
        <div>
          <div class="product-name">${p.name}</div>
          <div class="product-meta">${p.category[0].toUpperCase()+p.category.slice(1)}</div>
        </div>
        <div class="product-price">${euro(p.price)}</div>
      </div>
      <button class="add-btn" data-add="${p.id}">In winkelwagen</button>
    </article>
  `).join("");
}

function saveCart() {
  localStorage.setItem("luxewear-cart", JSON.stringify(cart));
}

function renderCart() {
  const totalQty = cart.reduce((sum,item) => sum + item.qty, 0);
  const total = cart.reduce((sum,item) => sum + item.qty * item.price, 0);
  cartCount.textContent = totalQty;

  if (!cart.length) {
    cartItems.innerHTML = `<div style="padding:60px 0;text-align:center;color:#888;font-size:13px">Je winkelwagen is nog leeg.</div>`;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-thumb" style="--thumb:${item.color}"></div>
        <div>
          <h3>${item.name}</h3>
          <p>${euro(item.price)}</p>
          <div class="qty">
            <button data-minus="${item.id}" aria-label="Aantal verminderen">−</button>
            <span>${item.qty}</span>
            <button data-plus="${item.id}" aria-label="Aantal verhogen">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${item.id}">Verwijder</button>
      </div>
    `).join("");
  }
  cartTotal.textContent = euro(total);
  saveCart();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({...product, qty:1});
  renderCart();
  showToast(`${product.name} toegevoegd aan je winkelwagen.`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("show");
  cartDrawer.setAttribute("aria-hidden","false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden","true");
}

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) addToCart(Number(add.dataset.add));

  const plus = e.target.closest("[data-plus]");
  if (plus) {
    const item = cart.find(i => i.id === Number(plus.dataset.plus));
    if (item) item.qty++;
    renderCart();
  }

  const minus = e.target.closest("[data-minus]");
  if (minus) {
    const item = cart.find(i => i.id === Number(minus.dataset.minus));
    if (item) item.qty--;
    cart = cart.filter(i => i.qty > 0);
    renderCart();
  }

  const remove = e.target.closest("[data-remove]");
  if (remove) {
    cart = cart.filter(i => i.id !== Number(remove.dataset.remove));
    renderCart();
  }
});

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    renderProducts(button.dataset.category);
  });
});

const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

document.getElementById("searchBtn").addEventListener("click", () => {
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden","false");
  setTimeout(() => searchInput.focus(), 50);
});
document.getElementById("closeSearch").addEventListener("click", () => {
  searchOverlay.classList.remove("open");
  searchOverlay.setAttribute("aria-hidden","true");
});
searchOverlay.addEventListener("click", e => {
  if (e.target === searchOverlay) searchOverlay.classList.remove("open");
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  const matches = products.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q));
  searchResults.innerHTML = q ? (matches.length
    ? matches.map(p => `<div class="search-result"><span>${p.name}</span><strong>${euro(p.price)}</strong></div>`).join("")
    : `<p style="color:#888;font-size:13px">Geen producten gevonden.</p>`)
    : "";
});

document.getElementById("newsletterForm").addEventListener("submit", e => {
  e.preventDefault();
  e.target.reset();
  showToast("Bedankt! Je bent ingeschreven.");
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Je winkelwagen is nog leeg.");
    return;
  }
  showToast("Demo: afrekenen kan hier worden gekoppeld aan je betaalprovider.");
});

document.getElementById("menuBtn").addEventListener("click", () => {
  const nav = document.querySelector(".nav");
  const open = nav.style.display === "flex";
  nav.style.display = open ? "" : "flex";
  nav.style.position = "absolute";
  nav.style.top = "68px";
  nav.style.left = "0";
  nav.style.right = "0";
  nav.style.padding = "20px 5%";
  nav.style.background = "#fff";
  nav.style.flexDirection = "column";
  nav.style.gap = "18px";
  nav.style.borderBottom = "1px solid #e7e5e2";
});

renderProducts();
renderCart();
