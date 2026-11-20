const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

(function preloader(){
  const pre   = $('#preloader');
  const bar   = $('#loadBar');
  const count = $('#loadCount');
  const total = prefersReduced ? 200 : 1300;
  const start = performance.now();

  function tick(now){
    const p = Math.min((now - start) / total, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(eased * 100);
    bar.style.width = val + '%';
    count.textContent = val;
    if (p < 1){
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.add('loaded');
        setTimeout(() => pre.remove(), 900);
      }, 220);
    }
  }
  requestAnimationFrame(tick);
})();

(function navScroll(){
  const nav = $('#nav');
  const progress = $('#progress');
  function onScroll(){
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function mobileMenu(){
  const burger = $('#burger');
  const menu   = $('#mobileMenu');
  function toggle(force){
    const open = force ?? !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('locked', open);
  }
  burger.addEventListener('click', () => toggle());
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
})();

(function reveal(){
  const targets = $$('.reveal, .reveal-scale');
  if (prefersReduced || !('IntersectionObserver' in window)){
    targets.forEach(t => t.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
})();

(function counters(){
  const els = $$('.counter[data-target]');
  if (!els.length) return;

  function fmt(n, suffix){
    return Math.round(n).toLocaleString('en-IN') + (suffix || '');
  }
  function animate(el){
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1700;
    const start = performance.now();
    function step(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, suffix);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, suffix);
    }
    requestAnimationFrame(step);
  }

  if (prefersReduced || !('IntersectionObserver' in window)){
    els.forEach(el => el.textContent = fmt(parseFloat(el.dataset.target), el.dataset.suffix));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){ animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

(function cursor(){
  if (isTouch || prefersReduced) return;
  const ring = $('#cursor');
  const dot  = $('#cursorDot');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  document.body.classList.add('has-cursor');
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  (function loop(){
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
  const growables = 'a, button, .blend-card, .sub-card, .faq-q, .dot, [data-magnetic]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(growables)) ring.classList.add('grow');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(growables)) ring.classList.remove('grow');
  });
})();

(function magnetic(){
  if (isTouch || prefersReduced) return;
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

(function parallax(){
  if (isTouch || prefersReduced) return;
  const layers = $$('[data-parallax]');
  if (!layers.length) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  (function loop(){
    cx += (mx - cx) * 0.05;
    cy += (my - cy) * 0.05;
    layers.forEach(l => {
      const s = parseFloat(l.dataset.parallax) * 100;
      l.style.translate = `${cx * s}px ${cy * s}px`;
    });
    requestAnimationFrame(loop);
  })();
})();

(function liveClock(){
  const el = $('#liveClock');
  if (!el) return;
  function tick(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss} IST`;
  }
  tick();
  setInterval(tick, 1000);
})();

(function liveRoast(){
  const pathEl = $('#roastPath');
  const areaEl = $('#roastArea');
  const dotEl  = $('#roastDot');
  const markEl = $('#roastMarker');
  const tempEl = $('#liveTemp');
  const heroTemp = $('#heroTemp');
  const elapsedEl = $('#roastElapsed');
  if (!pathEl) return;

  const W = 600, H = 200, P = 24;
  const MIN = 80, MAX = 220;
  const MAX_POINTS = 32;

  let temps = [92, 96, 104, 118, 132, 148, 162, 174, 182, 188, 192, 195, 198];
  let elapsedSec = 12 * 60 + 42; 

  function nextTemp(prev){
    if (prev < 205) return prev + (Math.random() * 2.4 + 1.2);
    return Math.min(212, Math.max(204, prev + (Math.random() - 0.5) * 1.6));
  }

  function draw(){
    const n = temps.length;
    const stepX = (W - P * 2) / (MAX_POINTS - 1);
    
    const pts = temps.map((t, i) => {
      const x = P + i * stepX; 
      const y = H - P - ((t - MIN) / (MAX - MIN)) * (H - P * 2);
      return [x, Math.max(P, Math.min(H - P, y))];
    });

    const lineD = pts.map((p, i) =>
      (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)
    ).join(' ');
    const areaD = lineD +
      ` L${pts[pts.length - 1][0].toFixed(1)},${(H - P).toFixed(1)}` +
      ` L${pts[0][0].toFixed(1)},${(H - P).toFixed(1)} Z`;

    pathEl.setAttribute('d', lineD);
    areaEl.setAttribute('d', areaD);

    const last = pts[pts.length - 1];
    dotEl.setAttribute('cx', last[0].toFixed(1));
    dotEl.setAttribute('cy', last[1].toFixed(1));

    markEl.setAttribute('x1', last[0].toFixed(1));
    markEl.setAttribute('x2', last[0].toFixed(1));

    const cur = temps[temps.length - 1];
    const curStr = cur.toFixed(1) + '°C';
    if (tempEl.textContent !== curStr){
      tempEl.textContent = curStr;
      tempEl.classList.remove('pulse');
      void tempEl.offsetWidth;
      tempEl.classList.add('pulse');
    }
    if (heroTemp) heroTemp.textContent = curStr;
  }

  draw();

  setInterval(() => {
    if (document.hidden) return;
    temps.push(nextTemp(temps[temps.length - 1]));
    if (temps.length > MAX_POINTS) temps.shift();
    elapsedSec += 2;
    const m = Math.floor(elapsedSec / 60);
    const s = String(elapsedSec % 60).padStart(2, '0');
    elapsedEl.textContent = `${m}:${s}`;
    draw();
  }, 2000);
})();

(function liveFeed(){
  const feedEl = $('#liveFeed');
  const countEl = $('#feedCount');
  const lastEl = $('#lastOrderTime');
  const kpiOrders = $('#kpiOrders');
  const kpiRev = $('#kpiRevenue');
  if (!feedEl) return;

  const ORDERS = [
    { name:'Aanya S.',  city:'Bandra',     item:'Ethiopia Guji · 250g',     amt:780  },
    { name:'Rohan M.',  city:'Andheri',    item:'House Blend · 500g',       amt:1150 },
    { name:'Priya K.',  city:'Juhu',       item:'Cold Brew Kit',            amt:1450 },
    { name:'Arjun D.',  city:'Powai',      item:'Daily Grind Subscription', amt:1180 },
    { name:'Kavya R.',  city:'Colaba',     item:'Monsooned Malabar · 250g', amt:620  },
    { name:'Vivaan T.', city:'BKC',        item:'Kenya AA Nyeri · 250g',    amt:890  },
    { name:'Meera J.',  city:'Lower Parel',item:'Colombia Huila · 500g',    amt:1380 },
    { name:'Aditya V.', city:'Worli',      item:'Roaster\'s Table',         amt:2180 },
    { name:'Isha P.',   city:'Versova',    item:'Ethiopia Guji · 500g',     amt:1480 },
    { name:'Kabir L.',  city:'Dadar',      item:'Taster Subscription',      amt:680  },
    { name:'Tara N.',   city:'Bandra',     item:'Cold Brew Kit',            amt:1450 },
    { name:'Dev S.',    city:'Juhu',       item:'Monsooned Malabar · 500g', amt:1180 },
    { name:'Zara M.',   city:'Andheri',    item:'Kenya AA Nyeri · 500g',    amt:1680 },
    { name:'Reyansh K.',city:'Powai',      item:'Colombia Huila · 250g',    amt:720  }
  ];

  let seen = [];
  let orderCountRecent = 4;

  function timeStr(){
    const d = new Date();
    return String(d.getHours()).padStart(2,'0') + ':' +
           String(d.getMinutes()).padStart(2,'0');
  }

  function addOrder(initial = false){
    const o = ORDERS[Math.floor(Math.random() * ORDERS.length)];
    
    if (!initial && seen[seen.length - 1] === o.name){
      return addOrder(initial);
    }
    seen.push(o.name);
    if (seen.length > 12) seen.shift();

    const row = document.createElement('div');
    row.className = 'feed-row' + (initial ? '' : ' new');
    row.innerHTML = `
      <div class="feed-top">
        <span class="feed-name">${o.name}</span>
        <span class="feed-time">${timeStr()}</span>
      </div>
      <div class="feed-bottom">
        <span class="feed-item">${o.item}</span>
        <span class="feed-amt">₹${o.amt.toLocaleString('en-IN')}</span>
      </div>
      <div class="feed-city">${o.city}</div>
    `;
    feedEl.prepend(row);
    while (feedEl.children.length > 5) feedEl.lastChild.remove();

    if (!initial){
      if (kpiOrders) {
        let current = parseInt(kpiOrders.textContent) || 187;
        kpiOrders.textContent = current + 1;
        kpiOrders.classList.add('tick');
        setTimeout(() => kpiOrders.classList.remove('tick'), 400);
      }
      if (kpiRev) {
        let current = parseInt(kpiRev.textContent.replace(/[^0-9]/g, '')) || 84270;
        kpiRev.textContent = '₹' + (current + o.amt).toLocaleString('en-IN');
        kpiRev.classList.add('tick');
        setTimeout(() => kpiRev.classList.remove('tick'), 400);
      }
      if (lastEl) {
        lastEl.textContent = 'Just now';
        setTimeout(() => { lastEl.textContent = '5 sec ago'; }, 5000);
      }
      if (countEl) {
        orderCountRecent++;
        countEl.textContent = orderCountRecent;
        setTimeout(() => {
          orderCountRecent = Math.max(1, orderCountRecent - 1);
          if (countEl) countEl.textContent = orderCountRecent;
        }, 60000);
      }
    }
  }

  for (let i=0; i<4; i++) addOrder(true);

  let feedInterval = setInterval(() => {
    if (!document.hidden) {
      addOrder();
      clearInterval(feedInterval);
      feedInterval = setInterval(arguments.callee, 4000 + Math.random() * 4000);
    }
  }, 5000);
})();

(function dashboardReveals(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  
  $$('.city-sales, .peak-bars, .bean-list').forEach(el => io.observe(el));
})();

(function testimonials(){
  const quotes = $$('.quote');
  const dotsWrap = $('#quoteDots');
  if(!quotes.length || !dotsWrap) return;
  let current = 0;

  quotes.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to quote ' + (i + 1));
    d.addEventListener('click', () => {
      goTo(i);
      resetInterval();
    });
    dotsWrap.appendChild(d);
  });
  const dots = $$('.dot', dotsWrap);

  function goTo(index) {
    if(index === current) return;
    quotes[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    quotes[current].classList.add('active');
    dots[current].classList.add('active');
  }

  let slideInterval = setInterval(() => {
    if (!document.hidden) goTo((current + 1) % quotes.length);
  }, 6000);

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      if (!document.hidden) goTo((current + 1) % quotes.length);
    }, 6000);
  }
})();

(function faq(){
  const items = $$('.faq-item');
  items.forEach(item => {
    const btn = $('.faq-q', item);
    const ans = $('.faq-a', item);
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      items.forEach(i => {
        i.classList.remove('open');
        $('.faq-a', i).style.maxHeight = null;
      });
      
      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
})();

const cartBtn = $('#cartBtn');
const cartOverlay = $('#cartOverlay');
const cartDrawer = $('#cartDrawer');
const cartClose = $('#cartClose');
const cartItemsContainer = $('#cartItemsContainer');
const cartFooter = $('#cartFooter');
const cartTotal = $('#cartTotal');
const cartBadge = $('#cartBadge');
const cartCountText = $('#cartCountText');
const toastContainer = $('#toastContainer');

let cart = [];

function toggleCart(open) {
  cartDrawer.classList.toggle('open', open);
  cartOverlay.classList.toggle('open', open);
  document.body.classList.toggle('locked', open);
}

cartBtn.addEventListener('click', () => toggleCart(true));
cartClose.addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));

$$('.blend-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const imgClass = btn.dataset.img;

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ name, price, imgClass, qty: 1 });
    }

    const originalText = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = 'var(--green)';
    btn.style.color = '#08080A';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 1000);

    showToast(name + ' added to cart!');
    updateCartUI();
    
    cartBadge.classList.remove('pop');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('pop');
  });
});

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  cartBadge.textContent = totalItems;
  cartBadge.classList.toggle('show', totalItems > 0);
  cartCountText.textContent = `(${totalItems})`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
        </svg>
        <p>Your cart is empty.</p>
        <p style="font-size:.8rem;margin-top:8px;">Add some fresh roasts!</p>
      </div>
    `;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  cartTotal.textContent = '₹' + totalPrice.toLocaleString('en-IN');

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img ${item.imgClass}">${item.name.charAt(0)}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>₹${item.price} / 250g</p>
      </div>
      <div class="cart-item-actions">
        <div class="cart-item-price">₹${item.price * item.qty}</div>
        <div class="cart-qty">
          <button onclick="updateQty('${item.name}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty('${item.name}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateQty = function(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }
  updateCartUI();
};

window.checkout = function() {
  if(cart.length === 0) return;
  
  const btn = $('.cart-checkout-btn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span>Processing...</span>';
  btn.disabled = true;
  
  setTimeout(() => {
    showToast('Order placed successfully! 🎉');
    cart = [];
    updateCartUI();
    toggleCart(false);
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }, 1500);
};

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  toastContainer.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

$('#year').textContent = new Date().getFullYear();

updateCartUI();