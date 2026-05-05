/*
  catalogo.js — CheFlix
  Espera que `movies` esté definido en el template antes de cargar este script:
    <script>const movies = {{ movies_json|safe }};</script>
    <script src="{% static 'movies/js/catalogo.js' %}"></script>
*/

/* ── ESTADO ── */
let activeFilter = 'all';
let searchQuery  = '';
let activeTipo   = 'todos';
const sortModes  = { compra: 'default', alquiler: 'default', compra_alquiler: 'default' };

const TIPOS = ['compra', 'alquiler', 'compra_alquiler'];

const BADGE_LABELS = {
  compra:          'Solo Compra',
  alquiler:        'Solo Alquiler',
  compra_alquiler: 'Compra · Alquiler',
};

/* ── HELPERS ── */
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

function filterMovies(tipo) {
  let list = movies.filter(m => m.tipo === tipo);

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

  const s = sortModes[tipo];
  if (s === 'rating')    list.sort((a, b) => parseFloat(b.imdb_rating) - parseFloat(a.imdb_rating));
  if (s === 'price_asc') list.sort((a, b) => {
    const pa = parseInt(a.precio_alquiler || a.precio_compra) || 0;
    const pb = parseInt(b.precio_alquiler || b.precio_compra) || 0;
    return pa - pb;
  });
  if (s === 'year')      list.sort((a, b) => b.año - a.año);

  return list;
}

/* ── TEMPLATES ── */
function cardHTML(m, i) {
  const genres = m.genero.split(',').slice(0, 2)
    .map(g => `<span class="genre-tag">${g.trim()}</span>`).join('');

  const badge = `<span class="card-badge badge-${m.tipo}">${BADGE_LABELS[m.tipo]}</span>`;

  let overlayBtns = '';
  if (m.tipo === 'compra' || m.tipo === 'compra_alquiler') {
    overlayBtns += `<button class="overlay-btn buy"
      onclick="event.stopPropagation(); alert('Comprar: ${m.titulo} — $${m.precio_compra}')">
      Comprar · $${parseInt(m.precio_compra).toLocaleString('es-AR')}
    </button>`;
  }
  if (m.tipo === 'alquiler' || m.tipo === 'compra_alquiler') {
    overlayBtns += `<button class="overlay-btn rent"
      onclick="event.stopPropagation(); alert('Alquilar: ${m.titulo} — $${m.precio_alquiler}')">
      Alquilar · $${parseInt(m.precio_alquiler).toLocaleString('es-AR')}
    </button>`;
  }
  overlayBtns += `<button class="overlay-btn detail"
    onclick="window.location.href='/peliculas/${m.id}/'">Ver detalle</button>`;

  let pills = '';
  if (m.precio_compra)   pills += `<div class="price-pill buy"><span class="label">Compra</span>$${parseInt(m.precio_compra).toLocaleString('es-AR')}</div>`;
  if (m.precio_alquiler) pills += `<div class="price-pill rent"><span class="label">Alquilar</span>$${parseInt(m.precio_alquiler).toLocaleString('es-AR')}</div>`;

  return `
  <div class="movie-card" style="animation-delay:${i * 40}ms">
    <div class="card-poster">
      ${posterHTML(m)}
      ${badge}
      <div class="card-rating">★ ${m.imdb_rating}</div>
      <div class="card-overlay">${overlayBtns}</div>
    </div>
    <div class="card-info">
      <div class="card-genres">${genres}</div>
      <p class="card-title" title="${m.titulo}">${m.titulo}</p>
      <p class="card-meta">${m.director} · ${m.año}</p>
      <div class="card-prices">${pills}</div>
    </div>
  </div>`;
}

/* ── RENDER ── */
function render() {
  TIPOS.forEach(tipo => {
    const section = document.getElementById(`section-${tipo}`);
    const grid    = document.getElementById(`grid-${tipo}`);
    const counter = document.getElementById(`count-${tipo}`);

    if (activeTipo !== 'todos' && activeTipo !== tipo) {
      section.classList.add('hidden');
      return;
    }

    const list = filterMovies(tipo);
    counter.textContent = `${list.length}`;

    if (!list.length) {
      section.classList.add('hidden');
      grid.innerHTML = '';
    } else {
      section.classList.remove('hidden');
      grid.innerHTML = list.map((m, i) => cardHTML(m, i)).join('');
    }
  });

  const totalVisible = TIPOS.reduce((acc, t) => {
    if (activeTipo !== 'todos' && activeTipo !== t) return acc;
    return acc + filterMovies(t).length;
  }, 0);

  document.getElementById('globalEmpty').classList.toggle('visible', totalVisible === 0);
}

/* ── EVENTOS ── */
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

document.querySelectorAll('.tipo-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tipo-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTipo = tab.dataset.tipo;
    render();
  });
});

document.querySelectorAll('.section-sort select').forEach(sel => {
  sel.addEventListener('change', e => {
    sortModes[e.target.dataset.section] = e.target.value;
    render();
  });
});

render();
