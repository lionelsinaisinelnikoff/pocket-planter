/* Pocket Planter — Dynamic App (Brand Box Edition) */

const BASE_PRICE = 28;
const PRODUCT_IMAGES = [
  { src: 'assets/images/IMG_4217.jpg', alt: 'Pocket Planter kit front view' },
  { src: 'assets/images/IMG_4218.jpg', alt: 'Pocket Planter side view' },
  { src: 'assets/images/IMG_4219.jpg', alt: 'Pocket Planter seed dispenser' },
  { src: 'assets/images/IMG_4220.jpg', alt: 'Pocket Planter water squirter' },
  { src: 'assets/images/IMG_4221.jpg', alt: 'Pocket Planter in use' },
  { src: 'assets/images/IMG_4270.jpg', alt: 'Pocket Planter held in hand' },
];

let cart = loadCart();
let currentImageIndex = 0;
let lightboxIndex = 0;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();
  initReveal();
  initLeaves();
  initGallery();
  initProductGallery();
  initSteps();
  initShop();
  initCart();
  initCheckout();
  initBottomNav();
  updateCartUI();
});

function initLoader() {
  const loader = $('#pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 500);
  });
}

function initNav() {
  const toggle = $('#navToggle');
  const mobileNav = $('#mobileNav');

  toggle?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', !open);
  });

  mobileNav?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => mobileNav.classList.add('hidden'));
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
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

function initGallery() {
  const grid = $('#galleryGrid');
  PRODUCT_IMAGES.forEach((img, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy">`;
    item.addEventListener('click', () => openLightbox(i));
    grid.appendChild(item);
  });

  grid.querySelectorAll('.reveal').forEach((el) => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
  });

  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  $('#lightboxNext').addEventListener('click', () => navigateLightbox(1));
  $('#lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  lightboxIndex = index;
  updateLightboxImage();
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const img = PRODUCT_IMAGES[lightboxIndex];
  $('#lightboxImg').src = img.src;
  $('#lightboxImg').alt = img.alt;
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
  $('#productMainImg').alt = img.alt;
  $$('.product-thumb').forEach((t, i) => t.classList.toggle('active', i === index));
}

function initSteps() {
  const steps = $$('.step-card');
  const section = $('#how-it-works');

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
    const qty = $('#qty');
    qty.value = Math.max(1, parseInt(qty.value, 10) - 1);
    updatePrice();
  });
  $('#qtyPlus').addEventListener('click', () => {
    const qty = $('#qty');
    qty.value = Math.min(10, parseInt(qty.value, 10) + 1);
    updatePrice();
  });
  $('#qty').addEventListener('change', () => {
    const qty = $('#qty');
    qty.value = Math.min(10, Math.max(1, parseInt(qty.value, 10) || 1));
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
    (item) =>
      item.addons.length === addons.length &&
      item.addons.every((a, i) => a.id === addons[i]?.id)
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: Date.now(),
      name: 'Pocket Planter Kit',
      image: PRODUCT_IMAGES[currentImageIndex].src,
      addons,
      unitPrice,
      qty,
    });
  }

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
    const addonText = item.addons.length
      ? item.addons.map((a) => a.name).join(', ')
      : 'Base kit only';

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
      </div>
    `;
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
  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitOrder();
  });
}

function openCheckout() {
  if (cart.length === 0) return;
  closeCart();

  const total = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  let html = '';
  cart.forEach((item) => {
    const addonText = item.addons.length
      ? ` (${item.addons.map((a) => a.name).join(', ')})`
      : '';
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

function submitOrder() {
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

  const orders = JSON.parse(localStorage.getItem('pp_orders') || '[]');
  orders.push(order);
  localStorage.setItem('pp_orders', JSON.stringify(orders));

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
          const id = e.target.id;
          items.forEach((item) => {
            item.classList.toggle('active', item.dataset.section === id);
          });
        }
      });
    },
    { threshold: 0.4, rootMargin: '-64px 0px -40% 0px' }
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('pp_cart') || '[]');
  } catch {
    return [];
  }
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