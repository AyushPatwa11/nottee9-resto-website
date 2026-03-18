/**
 * NOTTEE9 — main.js
 * Handles: loader, navbar, scroll reveals, menu fetch/filter,
 *          AI waiter, recommendations, reservation & event forms,
 *          QR code, gallery lightbox, cursor, toast, back-to-top
 */

/* ── CONFIG ──────────────────────────────────────────────────── */
const API  = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
             ? `http://localhost:5000/api`
             : '/api';

/* ── STATE ───────────────────────────────────────────────────── */
let allMenuItems = [];
let menuFilters  = { cat: 'all', type: 'all', cuisine: 'all' };
let menuCollapsed = true; // show only two rows initially

/* ── LOADER ──────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('gone');
    // Trigger hero reveals
    document.querySelectorAll('#hero .rv').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 130 + 400);
    });
  }, 2200);
});

/* ── CURSOR ──────────────────────────────────────────────────── */
const cur = document.getElementById('cur');
if (cur && window.innerWidth > 768) {
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .dish-card, .gi, .event-pill, .mfb, .mfb-sm').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.style.width        = '26px';
      cur.style.height       = '26px';
      cur.style.borderColor  = '#ff2b2b';
      cur.style.boxShadow    = '0 0 10px #ff2b2b';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.width       = '';
      cur.style.height      = '';
      cur.style.borderColor = '#00ff9c';
      cur.style.boxShadow   = '0 0 10px #00ff9c';
    });
  });
}

/* ── NAVBAR ──────────────────────────────────────────────────── */
const nav     = document.getElementById('nav');
const hamBtn  = document.getElementById('hamBtn');
const mobile  = document.getElementById('mobileMenu');
const sections = ['hero','specials','menu','recommend','gallery','reservation','events','qr','contact'];

window.addEventListener('scroll', () => {
  // Stuck state
  nav.classList.toggle('stuck', window.scrollY > 60);

  // Active link
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });

  // Parallax hero bg
  const bg = document.getElementById('heroBg');
  if (bg && window.scrollY < window.innerHeight * 1.5) {
    bg.style.transform = `scale(1.08) translateY(${window.scrollY * 0.28}px)`;
  }

  // Back to top
  document.getElementById('bttBtn').classList.toggle('show', window.scrollY > 500);
}, { passive: true });

// Hamburger
hamBtn.addEventListener('click', () => {
  const isOpen = !mobile.classList.contains('hidden');
  mobile.classList.toggle('hidden', isOpen);
  const spans = hamBtn.querySelectorAll('span');
  if (!isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
mobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobile.classList.add('hidden');
    hamBtn.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
document.querySelectorAll('.rv').forEach(el => revObs.observe(el));

/* ── BACK TO TOP ─────────────────────────────────────────────── */
document.getElementById('bttBtn').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── SMOOTH SCROLL ───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── FETCH & RENDER SPECIALS ─────────────────────────────────── */
async function loadSpecials() {
  try {
    const res  = await fetch(`${API}/menu/specials`);
    const data = await res.json();
    const grid = document.getElementById('specialsGrid');
    if (!data.success || !data.data.length) {
      grid.innerHTML = `<div class="col-span-full text-center py-10 text-white/30">No specials today — check back later!</div>`;
      return;
    }
    grid.innerHTML = data.data.map(d => buildCard(d, true)).join('');
  } catch {
    document.getElementById('specialsGrid').innerHTML = `<div class="col-span-full text-center py-10 text-white/30">Could not load specials</div>`;
  }
}

/* ── FETCH & RENDER MENU ─────────────────────────────────────── */
async function loadMenu() {
  try {
    const res  = await fetch(`${API}/menu`);
    const data = await res.json();
    allMenuItems = data.data || [];
    renderMenu();
  } catch {
    document.getElementById('menuGrid').innerHTML = `<div class="col-span-full text-center py-10 text-white/30">Could not load menu. Make sure the server is running.</div>`;
  }
}

/* ── BUILD DISH CARD HTML ────────────────────────────────────── */
function buildCard(d, isSpecial = false) {
  const badgeHtml = isSpecial
    ? `<span class="badge badge-red">⭐ Special</span>`
    : d.tags?.includes('bestseller') ? `<span class="badge badge-green">Bestseller</span>` : '';

  const spiceMap = { mild: '🟡 Mild', medium: '🟠 Med', spicy: '🔴 Spicy', 'extra-spicy': '🌶️ Extra' };
  const cuisMap  = { Indian:'ct-indian', Chinese:'ct-chinese', Asian:'ct-asian', Healthy:'ct-healthy', Continental:'ct-cont' };

  return `
    <div class="dish-card rv" data-cat="${d.category}" data-type="${d.type}" data-cuisine="${d.cuisine}">
      <div class="dish-img-wrap">
        <img src="${d.image}" alt="${d.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'"/>
        ${badgeHtml}
      </div>
      <div class="dish-body">
        <h3>${d.name}</h3>
        <p>${d.description}</p>
        <div class="flex items-center justify-between mt-2 flex-wrap gap-1">
          <div class="flex items-center gap-2">
            <span class="dish-price">₹${d.offerPrice && d.isOffer ? d.offerPrice : d.price}</span>
            ${d.isOffer && d.offerPrice ? `<span class="offer-price">₹${d.price}</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="type-dot ${d.type === 'veg' ? 'type-veg' : 'type-nonveg'}" title="${d.type}"></span>
            <span class="cuisine-tag ${cuisMap[d.cuisine] || 'ct-cont'}">${d.cuisine}</span>
            <span class="spice-badge">${spiceMap[d.spiceLevel] || d.spiceLevel}</span>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── MENU FILTERING ──────────────────────────────────────────── */
function renderMenu() {
  const grid  = document.getElementById('menuGrid');
  const empty = document.getElementById('menuEmpty');

  const filtered = allMenuItems.filter(d => {
    const catOk     = menuFilters.cat     === 'all' || d.category === menuFilters.cat;
    const typeOk    = menuFilters.type    === 'all' || d.type     === menuFilters.type;
    const cuisineOk = menuFilters.cuisine === 'all' || d.cuisine  === menuFilters.cuisine;
    return catOk && typeOk && cuisineOk;
  });

  if (!filtered.length) {
    grid.innerHTML  = '';
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  // determine columns based on responsive breakpoints (matches Tailwind grid classes)
  const w = window.innerWidth;
  let cols = 1;
  if (w >= 1280) cols = 4; // xl
  else if (w >= 1024) cols = 3; // lg
  else if (w >= 640) cols = 2; // sm

  const visibleCount = cols * 2; // two rows

  // decide which items to render depending on collapsed state
  const toRender = (menuCollapsed && filtered.length > visibleCount) ? filtered.slice(0, visibleCount) : filtered;

  grid.innerHTML = toRender.map(d => buildCard(d)).join('');
  // Re-observe new cards for scroll reveal
  grid.querySelectorAll('.rv').forEach((el, i) => {
    el.style.transitionDelay = `${i * 40}ms`;
    revObs.observe(el);
  });

  // Show/Hide toggle control
  const controlsId = 'menuToggleWrap';
  let controls = document.getElementById(controlsId);
  if (!controls) {
    controls = document.createElement('div');
    controls.id = controlsId;
    controls.className = 'text-center mt-6';
    grid.parentElement.appendChild(controls);
  }

  if (filtered.length > visibleCount) {
    controls.innerHTML = `<button id="menuToggleBtn" class="btn-neon btn-green py-2 px-6">${menuCollapsed ? `Show more (${filtered.length - visibleCount})` : 'Show less'}</button>`;
    document.getElementById('menuToggleBtn').onclick = () => { menuCollapsed = !menuCollapsed; renderMenu(); };
  } else {
    controls.innerHTML = '';
  }
}

// Filter button events
document.querySelectorAll('.mfb').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.menu-filters').querySelectorAll('.mfb').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    menuFilters.cat = btn.dataset.val;
    renderMenu();
  });
});

document.querySelectorAll('.mfb-sm').forEach(btn => {
  btn.addEventListener('click', () => {
    const sameGroup = btn.parentElement.querySelectorAll(`.mfb-sm[data-filter="${btn.dataset.filter}"]`);
    sameGroup.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    menuFilters[btn.dataset.filter] = btn.dataset.val;
    renderMenu();
  });
});

window.resetMenuFilters = () => {
  menuFilters = { cat: 'all', type: 'all', cuisine: 'all' };
  document.querySelectorAll('.mfb').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.mfb-sm').forEach((b, i) => b.classList.toggle('active', i === 0 || i === 3));
  renderMenu();
};

/* ── DISH RECOMMENDATIONS ────────────────────────────────────── */
window.getRecommendations = async () => {
  const type      = document.getElementById('rfType').value;
  const spice     = document.getElementById('rfSpice').value;
  const budget    = document.getElementById('rfBudget').value;
  const cuisine   = document.getElementById('rfCuisine').value;
  const grid      = document.getElementById('recommendResults');

  grid.classList.remove('hidden');
  grid.innerHTML = `<div class="col-span-full text-center py-8 text-white/30"><div class="inline-block w-6 h-6 border-2 border-[#1ea7ff] border-t-transparent rounded-full animate-spin mb-2"></div><p>Finding dishes...</p></div>`;

  try {
    const body = {};
    if (type)    body.type       = type;
    if (spice)   body.spiceLevel = spice;
    if (budget)  body.maxPrice   = parseInt(budget);
    if (cuisine) body.cuisine    = cuisine;

    const res  = await fetch(`${API}/menu/recommend`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.data?.length) {
      grid.innerHTML = `<div class="col-span-full text-center py-8 text-white/30">No dishes found for these filters.</div>`;
      return;
    }
    grid.innerHTML = `<div class="col-span-full text-sm text-[#00ff9c] mb-2 text-center">${data.message}</div>` +
                     data.data.map(d => buildCard(d)).join('');
    grid.querySelectorAll('.rv').forEach(el => revObs.observe(el));
  } catch {
    grid.innerHTML = `<div class="col-span-full text-center py-8 text-white/30">Server not available. Run <code>npm start</code> in /server</div>`;
  }
};

/* ── AVAILABILITY ────────────────────────────────────────────── */
async function checkSeatAvailability(date) {
  if (!date) return;
  try {
    const res  = await fetch(`${API}/reservations/availability?date=${date}`);
    const data = await res.json();
    const el   = document.getElementById('seatInfo');
    if (data.success) {
      el.innerHTML = `<span class="${data.data.available > 20 ? 'text-[#00ff9c]' : 'text-[#ffa500]'}">${data.data.available} seats available</span> out of ${data.data.totalSeats} on this date`;
    }
  } catch {
    document.getElementById('seatInfo').textContent = '156 total seats';
  }
}

/* ── RESERVATION FORM ────────────────────────────────────────── */
const rDateInput = document.getElementById('rDate');
if (rDateInput) {
  rDateInput.min = new Date().toISOString().split('T')[0];
  rDateInput.addEventListener('change', e => checkSeatAvailability(e.target.value));
  checkSeatAvailability(new Date().toISOString().split('T')[0]);
}

document.getElementById('resForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  const msg = document.getElementById('resMsg');

  const body = {
    name          : document.getElementById('rName').value.trim(),
    phone         : document.getElementById('rPhone').value.trim(),
    date          : document.getElementById('rDate').value,
    time          : document.getElementById('rTime').value,
    guests        : Number(document.getElementById('rGuests').value),
    specialRequest: document.getElementById('rSpecial').value.trim(),
  };

  try {
    const res  = await fetch(`${API}/reservations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();

    msg.classList.remove('hidden', 'text-[#ff2b2b]');
    if (data.success) {
      msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#00ff9c]/10 border border-[#00ff9c]/30 text-[#00ff9c]';
      msg.textContent = data.message;
      e.target.reset();
      showToast(`✅ ${data.message}`);

      // Also send via WhatsApp
      const wa = `Hi NOTTEE9! I'd like to confirm my reservation.\n\n👤 *Name:* ${body.name}\n📞 *Phone:* ${body.phone}\n📅 *Date:* ${body.date}\n⏰ *Time:* ${body.time}\n👥 *Guests:* ${body.guests}\n${body.specialRequest ? `📝 *Request:* ${body.specialRequest}` : ''}`;
      setTimeout(() => {
        if (confirm('Open WhatsApp to confirm your reservation?')) {
          window.open(`https://wa.me/919937582815?text=${encodeURIComponent(wa)}`, '_blank');
        }
      }, 1000);
    } else {
      msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#ff2b2b]/10 border border-[#ff2b2b]/30 text-[#ff2b2b]';
      msg.textContent = data.message;
    }
  } catch {
    msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#ff2b2b]/10 border border-[#ff2b2b]/30 text-[#ff2b2b]';
    msg.textContent = 'Server not available. Please call us directly: +91 99375 82815';
    msg.classList.remove('hidden');
  }
  btn.disabled = false;
});

/* ── EVENT FORM ──────────────────────────────────────────────── */
const eDateInput = document.getElementById('eDate');
if (eDateInput) eDateInput.min = new Date().toISOString().split('T')[0];

window.setEventType = (type) => {
  const sel = document.getElementById('eType');
  if (sel) sel.value = type;
  showToast(`${type} selected!`);
};

document.getElementById('eventForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  const msg = document.getElementById('eventMsg');

  const body = {
    name              : document.getElementById('eName').value.trim(),
    phone             : document.getElementById('ePhone').value.trim(),
    eventType         : document.getElementById('eType').value,
    venue             : document.getElementById('eVenue').value,
    date              : document.getElementById('eDate').value,
    time              : document.getElementById('eTime').value,
    guestCount        : Number(document.getElementById('eGuests').value),
    estimatedBudget   : Number(document.getElementById('eBudget').value) || null,
    cakeRequired      : document.getElementById('eCake').checked,
    decorationRequired: document.getElementById('eDecor').checked,
    specialRequests   : document.getElementById('eReq').value.trim(),
  };

  try {
    const res  = await fetch(`${API}/events`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    msg.classList.remove('hidden');
    if (data.success) {
      msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#00ff9c]/10 border border-[#00ff9c]/30 text-[#00ff9c]';
      msg.textContent = data.message;
      e.target.reset();
      showToast('🎉 Event request submitted!');
    } else {
      msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#ff2b2b]/10 border border-[#ff2b2b]/30 text-[#ff2b2b]';
      msg.textContent = data.message;
    }
  } catch {
    msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#ff2b2b]/10 border border-[#ff2b2b]/30 text-[#ff2b2b]';
    msg.textContent = 'Server not available. Please call: +91 99375 82815';
    msg.classList.remove('hidden');
  }
  btn.disabled = false;
});

/* ── CONTACT FORM ────────────────────────────────────────────── */
document.getElementById('conForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const msg = document.getElementById('conMsg');
  msg.className = 'mt-3 p-3 rounded text-sm text-center bg-[#00ff9c]/10 border border-[#00ff9c]/30 text-[#00ff9c]';
  msg.textContent = "✅ Message received! We'll respond soon.";
  msg.classList.remove('hidden');
  e.target.reset();
  showToast('✅ Message sent!');
});

// Recompute visible menu items on resize (debounced)
let __menuResizeT = null;
window.addEventListener('resize', () => {
  clearTimeout(__menuResizeT);
  __menuResizeT = setTimeout(() => {
    // when breakpoints change, re-render menu to update visibleCount and toggle
    if (document.getElementById('menu')) renderMenu();
  }, 180);
});

/* ── QR CODE ─────────────────────────────────────────────────── */
async function loadQR() {
  try {
    const url = `${window.location.origin}/#menu`;
    const res = await fetch(`${API}/qr/menu?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('qrCode').innerHTML = `<img src="${data.qr}" alt="QR Code" class="w-44 h-44 mx-auto rounded-lg" style="image-rendering:pixelated"/>`;
    }
  } catch {
    // Fallback: use a public QR API
    const url = encodeURIComponent(`${window.location.origin}/#menu`);
    document.getElementById('qrCode').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${url}&color=ff2b2b&bgcolor=0b0b0b" alt="QR Menu" class="w-44 h-44 mx-auto rounded-lg"/>`;
  }
}

/* ── GALLERY LIGHTBOX ────────────────────────────────────────── */
window.openLB = (el) => {
  const img = el.querySelector('img');
  document.getElementById('lbImg').src = img.src;
  document.getElementById('lightbox').classList.remove('hidden');
};
window.closeLB = (e) => {
  if (e.target === document.getElementById('lightbox')) {
    document.getElementById('lightbox').classList.add('hidden');
  }
};
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('lightbox').classList.add('hidden');
});

/* ── AI WAITER ───────────────────────────────────────────────── */
window.toggleAI = () => {
  document.getElementById('aiPanel').classList.toggle('hidden');
};

window.quickAsk = (q) => {
  document.getElementById('aiInput').value = q;
  sendAI();
};

window.sendAI = async () => {
  const input = document.getElementById('aiInput');
  const query = input.value.trim();
  if (!query) return;

  appendAIMsg(query, 'user');
  input.value = '';

  const typing = appendAIMsg('Searching our menu...', 'bot', true);

  try {
    const res  = await fetch(`${API}/menu/recommend`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body  : JSON.stringify({ query })
    });
    const data = await res.json();

    typing.remove();
    if (data.data?.length) {
      let html = `<strong>${data.message}</strong><br><br>`;
      data.data.slice(0, 4).forEach(d => {
        html += `🍽️ <strong>${d.name}</strong> — ₹${d.price}<br><small style="opacity:.7">${d.description.substring(0,55)}...</small><br>`;
      });
      appendAIMsg(html, 'bot', false, true);
    } else {
      appendAIMsg("Hmm, I couldn't find an exact match. Try: 'veg starter under ₹200' or 'spicy Chinese food'.", 'bot');
    }
  } catch {
    typing.remove();
    appendAIMsg('Server is offline. Please start the backend server with <code>npm start</code>.', 'bot', false, true);
  }
};

function appendAIMsg(text, role, isTemp = false, isHtml = false) {
  const chat = document.getElementById('aiChat');
  const div  = document.createElement('div');
  div.className = `ai-msg ${role}`;
  if (isHtml) div.innerHTML = text;
  else div.textContent = text;
  if (isTemp) div.style.opacity = '0.5';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

/* ── TOAST ───────────────────────────────────────────────────── */
let toastTimer;
window.showToast = (msg, isErr = false) => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast show${isErr ? ' err' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
};

/* ── COUNTER ANIMATION ───────────────────────────────────────── */
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const orig = el.textContent;
    const val  = parseFloat(orig);
    if (!isNaN(val) && val > 5) {
      let c = 0; const steps = 55; const inc = val / steps;
      const t = setInterval(() => {
        c = Math.min(c + inc, val);
        el.textContent = Number.isInteger(val) ? Math.round(c) : c.toFixed(1);
        if (c >= val) { el.textContent = orig; clearInterval(t); }
      }, 25);
    }
    cntObs.unobserve(el);
  });
}, { threshold: 0.6 });

/* ── INIT ────────────────────────────────────────────────────── */
(async () => {
  await Promise.all([ loadSpecials(), loadMenu(), loadQR() ]);
})();
