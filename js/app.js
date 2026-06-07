/* Pocket Planter — CMS-Powered App */

const API_BASE = window.location.port === '3000' || window.location.hostname === 'localhost'
  ? ''
  : (window.PP_API_BASE || '');

const FALLBACK_VIDEOS = [
  { title: 'Plant Anywhere', description: 'See how kids turn every walk into a planting adventure with Pocket Planter.', videoUrl: 'assets/videos/plant-anywhere.mp4', posterUrl: 'assets/videos/posters/plant-anywhere.jpg' },
  { title: 'Seed to Sprout', description: 'Watch the magic of growth — from a tiny seed to a living plant.', videoUrl: 'assets/videos/seed-sprout.mp4', posterUrl: 'assets/videos/posters/seed-sprout.jpg' },
  { title: 'Every Walk is a Garden', description: 'Families planting together, one pocketful of nature at a time.', videoUrl: 'assets/videos/walk-garden.mp4', posterUrl: 'assets/videos/posters/walk-garden.jpg' },
];

const FALLBACK_GALLERY = [
  { src: 'assets/images/IMG_4217.jpg', alt: 'Pocket Planter kit front view' },
  { src: 'assets/images/IMG_4218.jpg', alt: 'Pocket Planter side view' },
  { src: 'assets/images/IMG_4219.jpg', alt: 'Pocket Planter seed dispenser' },
  { src: 'assets/images/IMG_4220.jpg', alt: 'Pocket Planter water squirter' },
  { src: 'assets/images/IMG_4221.jpg', alt: 'Pocket Planter in use' },
  { src: 'assets/images/IMG_4270.jpg', alt: 'Pocket Planter held in hand' },
];

let siteContent = null;
let BASE_PRICE = 28;
let PRODUCT_IMAGES = FALLBACK_GALLERY;
let videos = FALLBACK_VIDEOS;
let cart = loadCart();
let currentImageIndex = 0;
let lightboxIndex = 0;
let activeVideoIndex = 0;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', async () => {
  initLoader();
  initNav();
  initReveal();
  initLeaves();
  await loadCMS();
  initVideos();
  initGallery();
  initProductGallery();
  initSteps();
  initShop();
  initCart();
  initCheckout();
  initBottomNav();
  updateCartUI();
});

async function loadCMS() {
  try {
    const res = await fetch(`${API_BASE}/api/content`);
    if (!res.ok) throw new Error('API unavailable');
    siteContent = await res.json();
    applyContent(siteContent);
    if (siteContent.videos?.length) videos = siteContent.videos;
    if (siteContent.gallery?.length) PRODUCT_IMAGES = siteContent.gallery;
  } catch {
    console.info('Running in static mode — using fallback content');
  }
}

function applyContent(c) {
  if (c.hero) {
    const parts = (c.hero.title || '').split(':');
    if (parts.length > 1) {
      $('#heroTitle').innerHTML = `${parts[0]}: <span class="block text-secondary">${parts.slice(1).join(':').trim()}</span>`;
    } else if (c.hero.title) {
      $('#heroTitle').textContent = c.hero.title;
    }
    if (c.hero.subtitle) $('#heroSubtitle').textContent = c.hero.subtitle;
    if (c.hero.cta) {
      $('#heroCta').innerHTML = `${c.hero.cta} <span class="material-symbols-outlined text-lg">arrow_forward</span>`;
    }
    if (c.hero.stats) {
      $('#statPrice').textContent = c.hero.stats.price ?? 28;
      $('#statSteps').textContent = c.hero.stats.steps ?? 4;
      $('#statAges').textContent = c.hero.stats.ages ?? '5–16';
    }
  }

  if (c.dilemma?.body) $('#dilemmaBody').textContent = c.dilemma.body;
  if (c.solution?.body) $('#solutionBody').textContent = c.solution.body;

  if (c.product) {
    BASE_PRICE = c.product.basePrice || 28;
    const nameEl = $('#productCard h3');
    if (nameEl && c.product.name) nameEl.textContent = c.product.name;
    const tagEl = $('#productCard .text-label-bold');
    if (tagEl && c.product.tagline) tagEl.textContent = c.product.tagline;
    const descEl = $('#productCard .text-body-md.text-on-surface-variant');
    if (descEl && c.product.description) descEl.textContent = c.product.description;
    updatePrice();
  }

  if (c.pitch) {
    if (c.pitch.equity) $('#pitchEquity').textContent = c.pitch.equity;
    if (c.pitch.funding) $('#pitchFunding').textContent = c.pitch.funding;
    if (c.pitch.email) {
      $('#pitchEmail').href = `mailto:${c.pitch.email}`;
      $('#pitchEmail').innerHTML = `<span class="material-symbols-outlined">mail</span> ${c.pitch.email}`;
    }
  }

  if (c.steps?.length) {
    const container = $('#steps');
    container.innerHTML = c.steps.map((s) => `
      <div class="step-card flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border-l-4 border-primary reveal" data-step="${s.num}">
        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">${s.num}</div>
        <div>
          <p class="text-body-md font-bold text-on-surface">${s.title}</p>
          <p class="text-body-md text-on-surface-variant">${s.body}</p>
        </div>
      </div>
    `).join('');
    $$('#steps .reveal').forEach((el) => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); }
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  }
}

function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => $('#pageLoader')?.classList.add('hidden'), 500);
  });
}

function initNav() {
  const toggle = $('#navToggle');
  const mobileNav = $('#mobileNav');
  toggle?.addEventListener('click', () => {
    const hidden = mobileNav.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', !hidden);
  });
  mobileNav?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => mobileNav.classList.add('hidden'));
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );
  $$('.reveal').forEach((el) => observer.observe(el));
}

function initLeaves() {
  for (let i = 0; i < 8; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'material-symbols-outlined leaf-decoration';
    leaf.textContent = 'eco';
    leaf.style.left = `${Math.random() * 100}vw`;
    leaf.style.top = `${Math.random() * 100}vh`;
    leaf.style.fontSize = `${Math.random() * 20 + 16}px`;
    document.body.appendChild(leaf);
  }
}

function initVideos() {
  const thumbs = $('#videoThumbs');
  if (!thumbs || !videos.length) return;

  thumbs.innerHTML = videos.map((v, i) => `
    <button class="video-thumb${i === 0 ? ' active' : ''}" data-index="${i}" type="button">
      <img class="video-thumb-poster" src="${v.posterUrl || v.poster_url}" alt="">
      <div class="video-thumb-info">
        <h4>${v.title}</h4>
        <p>${v.description || ''}</p>
      </div>
      <span class="material-symbols-outlined video-thumb-play">play_circle</span>
    </button>
  `).join('');

  thumbs.querySelectorAll('.video-thumb').forEach((btn) => {
    btn.addEventListener('click', () => playVideo(+btn.dataset.index));
  });

  playVideo(0);
}

function playVideo(index) {
  activeVideoIndex = index;
  const v = videos[index];
  const player = $('#featuredVideo');
  const url = v.videoUrl || v.video_url;
  const poster = v.posterUrl || v.poster_url;

  player.poster = poster;
  player.src = url;
  player.load();

  $('#featuredTitle').textContent = v.title;
  $('#featuredDesc').textContent = v.description || '';

  $$('.video-thumb').forEach((t, i) => t.classList.toggle('active', i === index));
}

function initGallery() {
  const grid = $('#galleryGrid');
  PRODUCT_IMAGES.forEach((img, i) => {
    const src = img.src;
    const alt = img.alt || '';
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy">`;
    item.addEventListener('click', () => openLightbox(i));
    grid.appendChild(item);
  });

  grid.querySelectorAll('.reveal').forEach((el) => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); }
    }, { threshold: 0.1 });
    obs.observe(el);
  });

  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  $('#lightboxNext').addEventListener('click', () => navigateLightbox(1));
  $('#lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  lightboxIndex = index;
  const img = PRODUCT_IMAGES[index];
  $('#lightboxImg').src = img.src;
  $('#lightboxImg').alt = img.alt || '';
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length;
  const img = PRODUCT_IMAGES[lightboxIndex];
  $('#lightboxImg').src = img.src;
  $('#lightboxImg').alt = img.alt || '';
}

function initProductGallery() {
  const thumbs = $('#productThumbs');
  PRODUCT_IMAGES.forEach((img, i) => {
    const btn = document.createElement('button');
    btn.className = `product-thumb${i === 0 ? ' active' : ''}`;
    btn.type = 'button';
    btn.setAttribute('aria-label', `View image ${i + 1}`);
    btn.innerHTML = `<img src="${img.src}" alt="">`;
    btn.addEventListener('click', () => setProductImage(i));
    thumbs.appendChild(btn);
  });
}

function setProductImage(index) {
  currentImageIndex = index;
  const img = PRODUCT_IMAGES[index];
  $('#productMainImg').src = img.src;
  $('#productMainImg').alt = img.alt || '';
  $$('.product-thumb').forEach((t, i) => t.classList.toggle('active', i === index));
}

function initSteps() {
  const steps = $$('.step-card');
  const section = $('#how-it-works');
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        let active = 0;
        const interval = setInterval(() => {
          steps.forEach((s, i) => s.classList.toggle('active', i <= active));
          active++;
          if (active >= steps.length) clearInterval(interval);
        }, 450);
        observer.unobserve(section);
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(section);
}

function initShop() {
  $$('.addon input').forEach((a) => a.addEventListener('change', updatePrice));
  $('#qtyMinus').addEventListener('click', () => {
    $('#qty').value = Math.max(1, parseInt($('#qty').value, 10) - 1);
    updatePrice();
  });
  $('#qtyPlus').addEventListener('click', () => {
    $('#qty').value = Math.min(10, parseInt($('#qty').value, 10) + 1);
    updatePrice();
  });
  $('#qty').addEventListener('change', () => {
    $('#qty').value = Math.min(10, Math.max(1, parseInt($('#qty').value, 10) || 1));
    updatePrice();
  });
  $('#addToCart').addEventListener('click', addCurrentToCart);
  updatePrice();
}

function getSelectedAddons() {
  const addons = [];
  $$('.addon input:checked').forEach((input) => {
    addons.push({
      id: input.value,
      name: input.closest('.addon').querySelector('strong').textContent,
      price: parseInt(input.dataset.price, 10),
    });
  });
  return addons;
}

function getUnitPrice() {
  return BASE_PRICE + getSelectedAddons().reduce((s, a) => s + a.price, 0);
}

function updatePrice() {
  const qty = parseInt($('#qty').value, 10) || 1;
  $('#totalPrice').textContent = getUnitPrice() * qty;
}

function addCurrentToCart() {
  const qty = parseInt($('#qty').value, 10) || 1;
  const addons = getSelectedAddons();
  const unitPrice = getUnitPrice();
  const existing = cart.find(
    (item) => item.addons.length === addons.length && item.addons.every((a, i) => a.id === addons[i]?.id)
  );

  if (existing) existing.qty += qty;
  else cart.push({ id: Date.now(), name: 'Pocket Planter Kit', image: PRODUCT_IMAGES[currentImageIndex].src, addons, unitPrice, qty });

  saveCart();
  updateCartUI();
  showToast(`Added ${qty} Pocket Planter${qty > 1 ? 's' : ''} to cart!`);
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
  const countEl = $('#cartCount');
  countEl.textContent = count;
  countEl.dataset.count = count;

  const itemsEl = $('#cartItems');
  const footerEl = $('#cartFooter');
  const emptyEl = $('#cartEmpty');

  if (cart.length === 0) {
    emptyEl.hidden = false;
    footerEl.hidden = true;
    itemsEl.querySelectorAll('.cart-item').forEach((el) => el.remove());
    return;
  }

  emptyEl.hidden = true;
  footerEl.hidden = false;
  itemsEl.querySelectorAll('.cart-item').forEach((el) => el.remove());

  let total = 0;
  cart.forEach((item) => {
    const lineTotal = item.unitPrice * item.qty;
    total += lineTotal;
    const addonText = item.addons.length ? item.addons.map((a) => a.name).join(', ') : 'Base kit only';
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img class="cart-item-img" src="${item.image}" alt="">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-addons">${addonText}</p>
        <div class="cart-item-row">
          <span>Qty: ${item.qty} — <span class="cart-item-price">${lineTotal} AED</span></span>
          <button class="cart-item-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>`;
    el.querySelector('.cart-item-remove').addEventListener('click', () => {
      cart = cart.filter((c) => c.id !== item.id);
      saveCart();
      updateCartUI();
    });
    itemsEl.appendChild(el);
  });
  $('#cartTotal').textContent = total;
}

function initCheckout() {
  $('#checkoutClose').addEventListener('click', closeCheckout);
  $('#checkoutOverlay').addEventListener('click', closeCheckout);
  $('#checkoutForm').addEventListener('submit', (e) => { e.preventDefault(); submitOrder(); });
}

function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  const total = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  let html = '';
  cart.forEach((item) => {
    const addonText = item.addons.length ? ` (${item.addons.map((a) => a.name).join(', ')})` : '';
    html += `<div class="summary-line"><span>${item.name}${addonText} × ${item.qty}</span><span>${item.unitPrice * item.qty} AED</span></div>`;
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

async function submitOrder() {
  const order = {
    id: `PP-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    customer: {
      name: $('#customerName').value.trim(),
      email: $('#customerEmail').value.trim(),
      school: $('#customerSchool').value.trim(),
      notes: $('#customerNotes').value.trim(),
    },
    items: cart.map((item) => ({
      name: item.name,
      addons: item.addons.map((a) => a.name),
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.qty,
    })),
    total: cart.reduce((s, i) => s + i.unitPrice * i.qty, 0),
  };

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('API error');
  } catch {
    const orders = JSON.parse(localStorage.getItem('pp_orders') || '[]');
    orders.push(order);
    localStorage.setItem('pp_orders', JSON.stringify(orders));
  }

  cart = [];
  saveCart();
  updateCartUI();
  closeCheckout();
  $('#checkoutForm').reset();
  showToast(`Order ${order.id} placed! We'll email you at ${order.customer.email}.`);
}

function initBottomNav() {
  const items = $$('.bottom-nav-item');
  const sections = ['hero', 'story', 'shop', 'pitch'];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          items.forEach((item) => item.classList.toggle('active', item.dataset.section === e.target.id));
        }
      });
    },
    { threshold: 0.4, rootMargin: '-64px 0px -40% 0px' }
  );
  sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem('pp_cart') || '[]'); } catch { return []; }
}

function saveCart() {
  localStorage.setItem('pp_cart', JSON.stringify(cart));
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.hidden = true; }, 400);
  }, 3500);
}