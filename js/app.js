/* Pocket Planter — Rafael's Inspirational Journey + Stripe */

const API_BASE = (window.location.port === '3000' || window.location.hostname === 'localhost')
  ? ''
  : (window.PP_API_BASE || 'https://pocket-planter-api.onrender.com');

const PRODUCT_IMAGES = [
  { src: 'assets/images/IMG_4270.jpg', alt: 'Pocket Planter in hand' },
  { src: 'assets/images/IMG_4217.jpg', alt: 'Pocket Planter kit' },
  { src: 'assets/images/IMG_4218.jpg', alt: 'Pocket Planter side view' },
  { src: 'assets/images/IMG_4221.jpg', alt: 'Pocket Planter in use' },
];

let BASE_PRICE = 28;
let cart = loadCart();
let currentImageIndex = 0;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', async () => {
  initLoader();
  initNav();
  initReveal();
  initLeaves();
  await loadCMS();
  initProductGallery();
  initSteps();
  initVideoThumbs();
  initShop();
  initCart();
  initCheckout();
  initBottomNav();
  updateCartUI();
});

async function loadCMS() {
  try {
    const res = await fetch(`${API_BASE}/api/content`);
    if (!res.ok) return;
    const c = await res.json();
    if (c.nav) renderNav(c.nav);
    if (c.hero?.eyebrow) $('#heroEyebrow').textContent = c.hero.eyebrow;
    if (c.hero?.title) $('#heroTitle').innerHTML = c.hero.title;
    if (c.hero?.subtitle) $('#heroSubtitle').innerHTML = c.hero.subtitle;
    if (c.hero?.cta) {
      $('#heroCta').innerHTML = `${c.hero.cta} <span class="material-symbols-outlined text-lg">arrow_forward</span>`;
      $('#heroCta').href = '#story';
    }
    if (c.story?.lead) $('#storyLead').textContent = c.story.lead;
    if (c.story?.body) $('#storyBody').textContent = c.story.body;
    if (c.story?.body2) $('#storyBody2').innerHTML = c.story.body2;
    if (c.story?.body3 && $('#storyBody3')) $('#storyBody3').textContent = c.story.body3;
    if (c.story?.quote && $('#storyQuote')) $('#storyQuote').textContent = c.story.quote;
    if (c.mission?.title) $('#missionTitle').textContent = c.mission.title;
    if (c.mission?.body) $('#missionBody').textContent = c.mission.body;
    if (c.mission?.body2) $('#missionBody2').textContent = c.mission.body2;
    if (c.mission?.marketLine && $('#missionMarket')) $('#missionMarket').textContent = c.mission.marketLine;
    if (c.mission?.stats?.length) renderMissionStats(c.mission.stats);
    if (c.stepsIntro?.text && $('#stepsIntro')) $('#stepsIntro').textContent = c.stepsIntro.text;
    if (c.shopIntro?.heading && $('#shopHeading')) $('#shopHeading').textContent = c.shopIntro.heading;
    if (c.shopIntro?.text && $('#shopIntro')) $('#shopIntro').textContent = c.shopIntro.text;
    if (c.product) {
      BASE_PRICE = c.product.basePrice || 28;
      if (c.product.name) $('#productName').textContent = c.product.name;
      if (c.product.tagline) $('#productTagline').textContent = c.product.tagline;
      if (c.product.description) $('#productDesc').textContent = c.product.description;
      if (c.product.benefitsKidsTitle && $('#benefitsKidsTitle')) $('#benefitsKidsTitle').textContent = c.product.benefitsKidsTitle;
      if (c.product.benefitsParentsTitle && $('#benefitsParentsTitle')) $('#benefitsParentsTitle').textContent = c.product.benefitsParentsTitle;
      if (c.product.benefitsKids) renderBenefits('benefitsKids', c.product.benefitsKids);
      if (c.product.benefitsParents) renderBenefits('benefitsParents', c.product.benefitsParents);
      updatePrice();
    }
    if (c.steps?.length >= 3) renderSteps(c.steps);
  } catch { /* static fallback */ }
}

function renderNav(nav) {
  if (nav.brand && $('#navBrand')) $('#navBrand').textContent = nav.brand;
  $$('[data-nav]').forEach((el) => {
    const label = nav[el.dataset.nav];
    if (label) el.textContent = label;
  });
}

function renderMissionStats(stats) {
  $('#missionStats').innerHTML = stats.map((s) => `
    <div class="mission-stat">
      <span class="mission-stat-num">${s.num}</span>
      <span class="mission-stat-label">${s.label}</span>
    </div>
  `).join('');
}

function renderBenefits(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map((t) => `<li>${t}</li>`).join('');
}

function renderSteps(steps) {
  $('#steps').innerHTML = steps.map((s) => `
    <article class="step-card bg-white rounded-2xl p-6 shadow-sm border-t-4 border-primary text-center reveal" data-step="${s.num}">
      <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mx-auto mb-5">${s.num}</div>
      <h3 class="text-headline-md text-primary mb-3">${s.title}</h3>
      <p class="text-body-md text-on-surface-variant">${s.body}</p>
    </article>
  `).join('');
  initSteps();
}

function initLoader() {
  window.addEventListener('load', () => setTimeout(() => $('#pageLoader')?.classList.add('hidden'), 500));
}

function initNav() {
  $('#navToggle')?.addEventListener('click', () => $('#mobileNav').classList.toggle('hidden'));
  $('#mobileNav')?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => $('#mobileNav').classList.add('hidden'));
  });
}

function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => obs.observe(el));
}

function initLeaves() {
  for (let i = 0; i < 6; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'material-symbols-outlined leaf-decoration';
    leaf.textContent = 'eco';
    leaf.style.left = `${Math.random() * 100}vw`;
    leaf.style.top = `${Math.random() * 100}vh`;
    leaf.style.fontSize = `${Math.random() * 16 + 14}px`;
    document.body.appendChild(leaf);
  }
}

function initProductGallery() {
  const thumbs = $('#productThumbs');
  if (!thumbs) return;
  PRODUCT_IMAGES.forEach((img, i) => {
    const btn = document.createElement('button');
    btn.className = `product-thumb${i === 0 ? ' active' : ''}`;
    btn.type = 'button';
    btn.innerHTML = `<img src="${img.src}" alt="">`;
    btn.addEventListener('click', () => {
      currentImageIndex = i;
      $('#productMainImg').src = img.src;
      $$('.product-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
    });
    thumbs.appendChild(btn);
  });
}

function initVideoThumbs() {
  const video = $('#featuredVideo');
  const thumbs = $$('.video-thumb');
  if (!video || !thumbs.length) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      const source = video.querySelector('source');
      if (source) source.src = thumb.dataset.src;
      else video.src = thumb.dataset.src;
      video.poster = thumb.dataset.poster;
      $('#featuredVideoTitle').textContent = thumb.dataset.title;
      $('#featuredVideoDesc').textContent = thumb.dataset.desc;
      video.load();
      video.play();
    });
  });
}

function initSteps() {
  const steps = $$('.step-card');
  const section = $('#how-it-works');
  if (!steps.length || !section) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      let n = 0;
      const t = setInterval(() => {
        steps.forEach((s, i) => s.classList.toggle('active', i <= n));
        if (++n >= steps.length) clearInterval(t);
      }, 400);
      obs.unobserve(section);
    });
  }, { threshold: 0.25 });
  obs.observe(section);
}

function initShop() {
  $$('.addon input').forEach((a) => a.addEventListener('change', updatePrice));
  $('#qtyMinus').addEventListener('click', () => { $('#qty').value = Math.max(1, +$('#qty').value - 1); updatePrice(); });
  $('#qtyPlus').addEventListener('click', () => { $('#qty').value = Math.min(10, +$('#qty').value + 1); updatePrice(); });
  $('#qty').addEventListener('change', () => { $('#qty').value = Math.min(10, Math.max(1, +$('#qty').value || 1)); updatePrice(); });
  $('#addToCart').addEventListener('click', addToCart);
  updatePrice();
}

function getSelectedAddons() {
  const addons = [];
  $$('.addon input:checked').forEach((input) => {
    addons.push({ id: input.value, name: input.closest('.addon').querySelector('strong').textContent, price: +input.dataset.price });
  });
  return addons;
}

function getUnitPrice() {
  return BASE_PRICE + getSelectedAddons().reduce((s, a) => s + a.price, 0);
}

function updatePrice() {
  $('#totalPrice').textContent = getUnitPrice() * (+$('#qty').value || 1);
}

function addToCart() {
  const qty = +$('#qty').value || 1;
  const addons = getSelectedAddons();
  const unitPrice = getUnitPrice();
  const existing = cart.find((i) => i.addons.length === addons.length && i.addons.every((a, j) => a.id === addons[j]?.id));
  if (existing) existing.qty += qty;
  else cart.push({ id: Date.now(), name: 'Pocket Planter Kit', image: PRODUCT_IMAGES[currentImageIndex].src, addons, unitPrice, qty });
  saveCart();
  updateCartUI();
  showToast(`Added ${qty} Pocket Planter${qty > 1 ? 's' : ''} — your journey begins.`);
  openCart();
}

function initCart() {
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartOverlay').addEventListener('click', closeCart);
  $('#checkoutBtn').addEventListener('click', openCheckout);
}

function openCart() {
  $('#cartDrawer').hidden = false;
  $('#cartOverlay').hidden = false;
  requestAnimationFrame(() => $('#cartDrawer').classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#cartOverlay').hidden = true;
  document.body.style.overflow = '';
  setTimeout(() => { $('#cartDrawer').hidden = true; }, 300);
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').dataset.count = count;
  if (!cart.length) {
    $('#cartEmpty').hidden = false;
    $('#cartFooter').hidden = true;
    $('#cartItems').querySelectorAll('.cart-item').forEach((el) => el.remove());
    return;
  }
  $('#cartEmpty').hidden = true;
  $('#cartFooter').hidden = false;
  $('#cartItems').querySelectorAll('.cart-item').forEach((el) => el.remove());
  let total = 0;
  cart.forEach((item) => {
    const line = item.unitPrice * item.qty;
    total += line;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img class="cart-item-img" src="${item.image}" alt="">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-addons">${item.addons.map((a) => a.name).join(', ') || 'Base kit'}</p>
        <div class="cart-item-row">
          <span>×${item.qty} — <strong class="cart-item-price">${line} AED</strong></span>
          <button class="cart-item-remove">Remove</button>
        </div>
      </div>`;
    el.querySelector('.cart-item-remove').addEventListener('click', () => {
      cart = cart.filter((c) => c.id !== item.id);
      saveCart();
      updateCartUI();
    });
    $('#cartItems').appendChild(el);
  });
  $('#cartTotal').textContent = total;
}

function initCheckout() {
  $('#checkoutClose').addEventListener('click', closeCheckout);
  $('#checkoutOverlay').addEventListener('click', closeCheckout);
  $('#checkoutForm').addEventListener('submit', (e) => { e.preventDefault(); payWithStripe(); });
}

function openCheckout() {
  if (!cart.length) return;
  closeCart();
  const total = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  let html = '';
  cart.forEach((item) => {
    const addons = item.addons.length ? ` (${item.addons.map((a) => a.name).join(', ')})` : '';
    html += `<div class="summary-line"><span>${item.name}${addons} × ${item.qty}</span><span>${item.unitPrice * item.qty} AED</span></div>`;
  });
  html += `<div class="summary-total"><span>Total</span><span>${total} AED</span></div>`;
  $('#checkoutSummary').innerHTML = html;
  $('#checkoutTotal').textContent = total;
  $('#checkoutModal').hidden = false;
  $('#checkoutOverlay').hidden = false;
  requestAnimationFrame(() => $('#checkoutModal').classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  $('#checkoutModal').classList.remove('open');
  $('#checkoutOverlay').hidden = true;
  document.body.style.overflow = '';
  setTimeout(() => { $('#checkoutModal').hidden = true; }, 300);
}

async function payWithStripe() {
  const btn = $('#stripePayBtn');
  btn.disabled = true;
  btn.textContent = 'Redirecting to Stripe…';

  const order = {
    customer: { name: $('#customerName').value.trim(), email: $('#customerEmail').value.trim() },
    items: cart.map((i) => ({ name: i.name, addons: i.addons.map((a) => a.name), qty: i.qty, unitPrice: i.unitPrice })),
    total: cart.reduce((s, i) => s + i.unitPrice * i.qty, 0),
  };

  try {
    const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout failed');
    window.location.href = data.url;
  } catch (err) {
    showToast(err.message || 'Payment unavailable — is the server running?');
    btn.disabled = false;
    btn.innerHTML = `Pay <span id="checkoutTotal">${order.total}</span> AED with Stripe`;
  }
}

function initBottomNav() {
  const items = $$('.bottom-nav-item');
  ['hero', 'story', 'mission', 'shop'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) items.forEach((i) => i.classList.toggle('active', i.dataset.section === id));
      });
    }, { threshold: 0.4 }).observe(el);
  });
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem('pp_cart') || '[]'); } catch { return []; }
}

function saveCart() {
  localStorage.setItem('pp_cart', JSON.stringify(cart));
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 400); }, 3500);
}