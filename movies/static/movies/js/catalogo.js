/* catalogo.js — CheFlix */

let activeFilter = 'all';
let searchQuery  = '';
let sortMode     = 'default';

function placeholderHTML(titulo) {
  const initials = titulo.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return `<div class="poster-placeholder">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <path d="m2 15 5-5 4 4 3-3 5 5"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
    </svg>
    <span>${initials}</span>
  </div>`;
}

function posterHTML(m) {
  if (m.poster && m.poster !== 'N/A') {
    return `<img src="${m.poster}" alt="${m.titulo}" loading="lazy"
      onerror="this.parentElement.innerHTML=placeholderHTML('${m.titulo}')">`;
  }
  return placeholderHTML(m.titulo);
}

function getFiltered() {
  let list = [...movies];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(m =>
      m.titulo.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.genero.toLowerCase().includes(q)
    );
  }

  if (activeFilter !== 'all') {
    list = list.filter(m => m.genero.toLowerCase().includes(activeFilter.toLowerCase()));
  }

  if (sortMode === 'rating')    list.sort((a, b) => parseFloat(b.imdb_rating) - parseFloat(a.imdb_rating));
  if (sortMode === 'price_asc') list.sort((a, b) => parseFloat(a.precio_compra || 0) - parseFloat(b.precio_compra || 0));
  if (sortMode === 'year')      list.sort((a, b) => b.año - a.año);

  return list;
}

// ── CSRF helper ──
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// ── Marcar botón como "en carrito" ──
function marcarEnCarrito(movieId) {
  const btn = document.querySelector(`[data-movie-id="${movieId}"]`);
  if (!btn) return;
  btn.textContent = '✓ En carrito';
  btn.style.color = 'var(--muted)';
  btn.style.cursor = 'default';
  btn.disabled = true;
}

// ── Agregar al carrito sin redirigir ──
async function agregarAlCarrito(movieId, btn) {
  const resp = await fetch(`/carrito/agregar/${movieId}/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
  });

  if (resp.ok) {
    carritoIds.push(movieId);
    marcarEnCarrito(movieId);
  } else if (resp.status === 400) {
    marcarEnCarrito(movieId);
  } else {
    window.location.href = '/login/';
  }
}

// ── Card HTML ──
function cardHTML(m, i) {
  const genres = m.genero.split(',').slice(0, 2)
    .map(g => `<span class="genre-tag">${g.trim()}</span>`).join('');

  const precio = m.precio_compra
    ? `$${parseInt(m.precio_compra).toLocaleString('es-AR')}`
    : 'Sin precio';

  const enCarrito = carritoIds.includes(m.id);

  const btnCompra = !m.precio_compra
    ? `<div class="price-pill buy" style="opacity:0.5">
         <span class="label">Compra</span>Sin precio
       </div>`
    : enCarrito
    ? `<button class="price-pill buy" data-movie-id="${m.id}" disabled
         style="cursor:default; color:var(--muted)">
         <span class="label">Compra</span>✓ En carrito
       </button>`
    : `<button class="price-pill buy" data-movie-id="${m.id}"
         style="cursor:pointer; width:100%"
         onclick="agregarAlCarrito(${m.id}, this)">
         <span class="label">Compra</span>${precio}
       </button>`;

  return `
  <div class="movie-card" style="animation-delay:${i * 40}ms">
    <div class="card-poster">
      ${posterHTML(m)}
      <div class="card-rating">★ ${m.imdb_rating}</div>
      <div class="card-overlay">
        <button class="overlay-btn detail"
          onclick="window.open('${m.trailer_url}', '_blank')">
          Ver trailer
        </button>
      </div>
    </div>
    <div class="card-info">
      <div class="card-genres">${genres}</div>
      <p class="card-title" title="${m.titulo}">${m.titulo}</p>
      <p class="card-meta">${m.director} · ${m.año}</p>
      <div class="card-prices">${btnCompra}</div>
    </div>
  </div>`;
}

function render() {
  const list  = getFiltered();
  const grid  = document.getElementById('grid-movies');
  const count = document.getElementById('count-movies');

  count.textContent = list.length;

  if (!list.length) {
    grid.innerHTML = '';
    document.getElementById('globalEmpty').classList.add('visible');
  } else {
    grid.innerHTML = list.map((m, i) => cardHTML(m, i)).join('');
    document.getElementById('globalEmpty').classList.remove('visible');
  }
}

document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value;
  render();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById('sortSelect').addEventListener('change', e => {
  sortMode = e.target.value;
  render();
});

render();