import './style.css';
import {
  TMDB_TOKEN,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
} from './config.js';

// DOM elements
const modalTrailer = document.querySelector('#modal-trailer');
const modalCast = document.querySelector('#modal-cast');

const prevPageBtn = document.querySelector('#prev-page-btn');
const nextPageBtn = document.querySelector('#next-page-btn');
const pageNumbersContainer = document.querySelector('#page-numbers');
const pageInfo = document.querySelector('#page-info');

const moviesGrid = document.querySelector('#movies-grid');
const watchlistElement = document.querySelector('#watchlist');

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

const typeSelect = document.querySelector('#type-select');
const genreSelect = document.querySelector('#genre-select');
const statusSelect = document.querySelector('#status-select');
const sortSelect = document.querySelector('#sort-select');

const toggleAdvancedBtn = document.querySelector('#toggle-advanced-filters');
const advancedFiltersPanel = document.querySelector('#advanced-filters-panel');

const countryCheckboxes = document.querySelectorAll('.country-checkbox');
const yearSelect = document.querySelector('#year-select');
const ratingSelect = document.querySelector('#rating-select');

const themeToggleBtn = document.querySelector('#theme-toggle');
const watchlistPageBtn = document.querySelector('#watchlist-page-btn');

const discoverView = document.querySelector('#discover-view');
const watchlistView = document.querySelector('#watchlist-view');
const statusChips = document.querySelectorAll('.status-chip');

const logoText = document.querySelector('#logo-text');
const discoverTitle = document.querySelector('#discover-title');
const topRatedTitle = document.querySelector('#top-rated-title');

const favoritesListElement = document.querySelector('#favorites-list');

let currentView = 'discover'; 

const typeChips = document.querySelectorAll('.type-chip');

const WATCHLIST_KEY = 'my-movie-watchlist';

// modal 
const detailsModal = document.querySelector('#details-modal');
if (!detailsModal) {
  console.error('Missing #details-modal in HTML');
}

const modalBackdrop =
  (detailsModal && detailsModal.querySelector('.modal-backdrop')) || null;
const modalCloseBtn = document.querySelector('#modal-close-btn');
const modalPoster = document.querySelector('#modal-poster');
const modalTitle = document.querySelector('#modal-title');
const modalMeta = document.querySelector('#modal-meta');
const modalOverview = document.querySelector('#modal-overview');
const modalFavoriteBtn = document.querySelector('#modal-favorite-btn');
const modalStatusButtons = detailsModal
  ? detailsModal.querySelectorAll('[data-modal-status]')
  : [];

// Mijn slider
const heroSliderInner = document.querySelector('#hero-slider-inner');

let modalCurrentItem = null;

let heroSlides = [];
let heroCurrentIndex = 0;
let heroIntervalId = null;

// Pagina
let currentPage = 1;
let totalPages = 1;
let lastResults = [];

let currentType = 'movie'; 
let currentWatchlistFilter = 'to-watch'; 
let watchlist = loadWatchlist();

// Init
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupViewToggle();
  setupFilterListeners();
  setupModalHandlers();
  setupTypeChips();
  updateTypeUI();
  fetchGenres();
  fetchDiscover();
  fetchTopRated();
  renderWatchlist();
  renderFavorites();
});

// ---------- Dark/light mode - Background kleur ----------
function setupThemeToggle() {
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.dataset.theme = savedTheme;
  themeToggleBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  themeToggleBtn.addEventListener('click', () => {
    const newTheme =
      document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
  });
}

// ---------- Switch ----------
function setupViewToggle() {
  if (watchlistPageBtn && discoverView && watchlistView) {
    watchlistPageBtn.addEventListener('click', () => {
      const isWatchlistOpen = watchlistView.classList.contains('view--active');

      if (isWatchlistOpen) {
        currentView = 'discover';

        watchlistView.classList.remove('view--active');
        watchlistView.classList.add('view--hidden');

        discoverView.classList.add('view--active');
        discoverView.classList.remove('view--hidden');

        watchlistPageBtn.textContent = 'My Watchlist';
      } else {
        currentView = 'watchlist';

        discoverView.classList.remove('view--active');
        discoverView.classList.add('view--hidden');

        watchlistView.classList.add('view--active');
        watchlistView.classList.remove('view--hidden');

        watchlistPageBtn.textContent = 'Back'; 
      }
    });
  }

  // status + favorite films of series
  statusChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const status = chip.dataset.status || '';

      statusChips.forEach((c) =>
        c.classList.toggle('status-chip--active', c === chip),
      );

      if (status === 'favorite') {
        currentWatchlistFilter = 'favorite';
      } else {
        currentWatchlistFilter = status || '';
      }

      renderWatchlist();
    });
  });
}

// ---------- Verschillende weergave per type ----------
function updateTypeUI() {
  if (!logoText) return;

  logoText.classList.remove(
    'logo-text--white',
    'logo-text--blue',
    'logo-text--green',
    'logo-text--purple',
  );

  if (currentType === 'movie') {
    logoText.textContent = 'CineNova';
    logoText.classList.add('logo-text--blue');

    if (discoverTitle) discoverTitle.textContent = 'Discover Movies';
    if (topRatedTitle) topRatedTitle.textContent = 'Top Rated Movies';
    document.title = 'CineNova';
  } else if (currentType === 'tv') {
    logoText.textContent = 'Serialfrenzy';
    logoText.classList.add('logo-text--green');

    if (discoverTitle) discoverTitle.textContent = 'Discover TV Shows';
    if (topRatedTitle) topRatedTitle.textContent = 'Top Rated TV Shows';
    document.title = 'Serialfrenzy';
  } else if (currentType === 'anime') {
    logoText.textContent = 'Animemania';
    logoText.classList.add('logo-text--purple');

    if (discoverTitle) discoverTitle.textContent = 'Discover Anime';
    if (topRatedTitle) topRatedTitle.textContent = 'Top Rated Anime';
    document.title = 'Animemania';
  } else {
    logoText.textContent = 'Watchlist vault';
    logoText.classList.add('logo-text--white');

    if (discoverTitle) discoverTitle.textContent = 'Discover';
    if (topRatedTitle) topRatedTitle.textContent = 'Top Rated';
    document.title = 'Watchlist vault';
  }

  document.body.dataset.type = currentType;
}

function truncate(text, maxLength = 160) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

// Omdat de api nu juist niet weet welke type wat is ga ik het hier toekennen naar mijn eigen types
function getBaseType() {
  if (currentType === 'all') return 'movie';
  if (currentType === 'anime') return 'tv';
  return currentType; 
}

// ---------- FILTERS ----------
function setupFilterListeners() {
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (!query) {
        currentPage = 1;
        fetchDiscover();
        return;
      }

      const baseType = currentType === 'anime' ? 'tv' : currentType;
      const effectiveType = baseType === 'all' ? 'movie' : baseType;
      const endpoint =
        effectiveType === 'movie' ? '/search/movie' : '/search/tv';

      try {
        const response = await fetch(
          `${TMDB_BASE_URL}${endpoint}?query=${encodeURIComponent(
            query,
          )}&include_adult=false&language=en-US&page=1`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
              accept: 'application/json',
            },
          },
        );

        if (!response.ok) throw new Error('Failed to search');

        const data = await response.json();
        let results = data.results || [];

        // omdat ik juist nog steeds animes tussen de movies en tv shows zag, heb ik met behulp van ai een manier gevonden om die alleen te tonen bij anime
        if (currentType === 'tv') {
          results = results.filter((item) => {
            const genreIds = item.genre_ids || [];
            return !genreIds.includes(16);
          });
        }

        lastResults = results;
        currentPage = 1;
        totalPages = data.total_pages || 1;
        renderPage();
        updatePaginationUI();
      } catch (error) {
        console.error(error);
        if (moviesGrid) {
          moviesGrid.innerHTML =
            '<p class="error">Your search failed. Please try again.</p>';
        }
      }
    });
  }

// mijn advance filter old code maaar het werkte niet uit (moet verwijnen voor uploaden)
  if (toggleAdvancedBtn && advancedFiltersPanel) {
    toggleAdvancedBtn.addEventListener('click', () => {
      const isHidden = advancedFiltersPanel.classList.toggle(
        'advanced-filters--hidden',
      );
      toggleAdvancedBtn.textContent = isHidden ? '⚙️ More' : '✖ Close';
      toggleAdvancedBtn.setAttribute('aria-expanded', String(!isHidden));
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      currentPage = 1;
      updateTypeUI();
      fetchGenres();
      fetchDiscover();
      fetchTopRated();
    });
  }

  [genreSelect, statusSelect, sortSelect, yearSelect, ratingSelect].forEach(
    (el) => {
      if (!el) return;
      el.addEventListener('change', () => {
        currentPage = 1;
        fetchDiscover();
      });
    },
  );

  countryCheckboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      currentPage = 1;
      fetchDiscover();
    });
  });

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        fetchDiscover();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage += 1;
        fetchDiscover();
      }
    });
  }
}

// ---------- Type opties ----------
function setupTypeChips() {
  if (!typeChips.length) return;

  typeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const newType = chip.dataset.type; 
      currentType = newType;

      // visual state of the chips
      typeChips.forEach((c) => {
        const t = c.dataset.type;
        const isActive = c === chip;

        c.classList.toggle('type-chip--active', isActive);
        c.classList.toggle('type-chip--all', t === 'all' && isActive);
        c.classList.toggle('type-chip--movie', t === 'movie' && isActive);
        c.classList.toggle('type-chip--tv', t === 'tv' && isActive);
        c.classList.toggle('type-chip--anime', t === 'anime' && isActive);
      });

      currentPage = 1;
      updateTypeUI();
      fetchGenres();
      fetchDiscover();
      fetchTopRated();
    });
  });
}

// ---------- Kaarten per pagina ----------
const ITEMS_PER_PAGE = 36;

function renderPage() {
  if (!moviesGrid) return;

  if (!lastResults || lastResults.length === 0) {
    moviesGrid.innerHTML = '<p>No results found.</p>';
    return;
  }

  const start = 0;
  const end = Math.min(ITEMS_PER_PAGE, lastResults.length);
  const pageItems = lastResults.slice(start, end);

  renderItems(pageItems, moviesGrid);
}

function updatePaginationUI() {
  if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;

  if (!pageNumbersContainer || totalPages <= 0) return;

  pageNumbersContainer.innerHTML = '';

  const maxButtons = 5;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let page = startPage; page <= endPage; page++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(page);
    btn.className = 'page-number';

    if (page === currentPage) {
      btn.classList.add('page-number--active');
    }

    btn.addEventListener('click', () => {
      if (page === currentPage) return;
      currentPage = page;
      fetchDiscover();
    });

    pageNumbersContainer.appendChild(btn);
  }
}

// ---------- DISCOVER ----------
async function fetchDiscover() {
  const params = new URLSearchParams({
    language: 'en-US',
    include_adult: 'false',
    page: String(currentPage),
  });

  const baseType = getBaseType();
  const endpoint =
    baseType === 'movie' ? '/discover/movie' : '/discover/tv';

  // Genre
  const genreId = genreSelect?.value;
  if (genreId) params.set('with_genres', genreId);

  // Status / jaar / rating
  const status = statusSelect?.value;
  const year = yearSelect?.value;
  const rating = ratingSelect?.value;

  if (year) {
    if (baseType === 'movie') {
      params.set('primary_release_year', year);
    } else {
      params.set('first_air_date_year', year);
    }
  }

  if (rating) {
    params.set('vote_average.gte', rating);
  }

  // Sort
  const sortBy = sortSelect?.value;
  if (sortBy) {
    if (baseType !== 'movie' && sortBy === 'original_title.asc') {
      params.set('sort_by', 'original_name.asc');
    } else {
      params.set('sort_by', sortBy);
    }
  }

  // Anime alleen
  if (currentType === 'anime') {
    params.set('with_genres', genreId || '16');
    if (!params.has('region') && !checkedCountries.length) {
      params.set('with_origin_country', 'JP');
    }
  }

  const url = `${TMDB_BASE_URL}${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch discover results');

    const data = await response.json();
    let results = data.results || [];

    // Remove anime from TV discover
    if (currentType === 'tv') {
      results = results.filter((item) => {
        const genreIds = item.genre_ids || [];
        return !genreIds.includes(16);
      });
    }

    lastResults = results;
    totalPages = data.total_pages || 1;
    renderPage();
    updatePaginationUI();
  } catch (error) {
    console.error(error);
    if (moviesGrid) {
      moviesGrid.innerHTML =
        '<p class="error">Could not load results. Please try again later.</p>';
    }
  }
}

// ---------- GENRES ----------
async function fetchGenres() {
  const baseType = getBaseType();
  const path =
    baseType === 'movie' ? '/genre/movie/list' : '/genre/tv/list';

  try {
    const response = await fetch(`${TMDB_BASE_URL}${path}?language=en`, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch genres');

    const data = await response.json();
    populateGenreSelect(data.genres);
  } catch (error) {
    console.error(error);
  }
}

function populateGenreSelect(genres) {
  if (!genreSelect) return;

  genreSelect.innerHTML = '<option value="">All genres</option>';
  genres.forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre.id;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });
}

// ---------- filter per type ----------
function filterTopItemsByType(items) {
  if (currentType === 'all') {
    return items;
  }

  if (currentType === 'movie') {
    return items.filter(
      (item) => item.media_type === 'movie' || 'title' in item,
    );
  }

  if (currentType === 'tv') {
    return items.filter((item) => {
      const isTv = item.media_type === 'tv' || 'name' in item;
      const genreIds = item.genre_ids || [];
      const isAnime = genreIds.includes(16);
      return isTv && !isAnime;
    });
  }

  if (currentType === 'anime') {
    // Anime: only Japanese TV shows
    return items.filter((item) => {
      const isTv = item.media_type === 'tv' || 'name' in item;
      const origin = item.origin_country || [];
      return (
        isTv &&
        Array.isArray(origin) &&
        origin.includes('JP')
      );
    });
  }

  return items;
}

// ---------- TOP RATED ----------
async function fetchTopRated() {
  const baseType = getBaseType();
  const endpoint =
    baseType === 'movie' ? '/movie/top_rated' : '/tv/top_rated';

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}${endpoint}?language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          accept: 'application/json',
        },
      },
    );

    if (!response.ok) throw new Error('Failed to fetch top rated');

    const data = await response.json();
    const rawItems = data.results || [];

    const filteredForType = filterTopItemsByType(rawItems);
    const topItems = filteredForType.slice(0, 12);

    renderHeroSlider(topItems);
  } catch (error) {
    console.error('Top rated error:', error);
  }
}

// ---------- mijn slider ----------
function renderHeroSlider(items) {
  heroSlides = items || [];
  heroCurrentIndex = 0;

  if (!heroSliderInner) return;

  if (!heroSlides.length) {
    heroSliderInner.innerHTML = '';
    return;
  }

  const baseType = getBaseType();

  // 3 per slide
  const perSlide = 3;
  const slides = [];
  for (let i = 0; i < heroSlides.length; i += perSlide) {
    slides.push(heroSlides.slice(i, i + perSlide));
  }

  heroSliderInner.innerHTML = `
    ${slides
      .map((group, slideIndex) => {
        const itemsHtml = group
          .map((item) => {
            const isMovie = baseType === 'movie';
            const title = isMovie ? item.title : item.name;
            const date = isMovie ? item.release_date : item.first_air_date;
            const rating = item.vote_average;
            const posterPath = item.backdrop_path || item.poster_path;
            const posterUrl = posterPath
              ? TMDB_IMAGE_BASE_URL + posterPath
              : 'https://via.placeholder.com/500x281?text=No+Image';
            const overview = truncate(item.overview, 120);

            return `
              <div class="hero-item" data-id="${item.id}">
                <img src="${posterUrl}" alt="${title}" class="hero-item-poster" />
                <div class="hero-item-body">
                  <h3 class="hero-item-title">${title}</h3>
                  <p class="hero-item-meta">
                    ${date ? date.slice(0, 4) : 'Unknown'} · ⭐ ${
              rating ? rating.toFixed(1) : 'N/A'
            }
                  </p>
                  <p class="hero-item-overview">${overview}</p>
                  <div class="hero-item-buttons">
                    <button type="button" class="hero-more-btn hero-open-btn">
                      More
                    </button>
                  </div>
                </div>
              </div>
            `;
          })
          .join('');

        return `
          <article class="hero-slide ${
            slideIndex === 0 ? 'hero-slide--active' : ''
          }" data-slide-index="${slideIndex}">
            <div class="hero-slide-content">
              ${itemsHtml}
            </div>
          </article>
        `;
      })
      .join('')}
    <div class="hero-dots">
      ${slides
        .map(
          (_, idx) => `
        <button
          type="button"
          class="hero-dot ${idx === 0 ? 'hero-dot--active' : ''}"
          data-index="${idx}"
        ></button>
      `,
        )
        .join('')}
    </div>
  `;

  const dots = heroSliderInner.querySelectorAll('.hero-dot');
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.index);
      setHeroSlide(index);
      restartHeroInterval();
    });
  });


  const slidesEls = heroSliderInner.querySelectorAll('.hero-slide');
  slidesEls.forEach((slideEl) => {
    const itemEls = slideEl.querySelectorAll('.hero-item');
    itemEls.forEach((itemEl) => {
      const id = Number(itemEl.dataset.id);
      const item = heroSlides.find((it) => it.id === id);
      if (!item) return;

      const openBtn = itemEl.querySelector('.hero-open-btn');
      if (openBtn) {
        openBtn.addEventListener('click', () => openModal(item));
      }
    });
  });

  restartHeroInterval();
}

function setHeroSlide(index) {
  if (!heroSliderInner) return;
  heroCurrentIndex = index;

  const slides = heroSliderInner.querySelectorAll('.hero-slide');
  const dots = heroSliderInner.querySelectorAll('.hero-dot');

  slides.forEach((slide, i) => {
    slide.classList.toggle('hero-slide--active', i === heroCurrentIndex);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('hero-dot--active', i === heroCurrentIndex);
  });
}

function restartHeroInterval() {
  if (heroIntervalId) {
    clearInterval(heroIntervalId);
  }

  if (!heroSlides.length || !heroSliderInner) return;

  heroIntervalId = setInterval(() => {
    const slidesCount = heroSliderInner.querySelectorAll('.hero-slide').length;
    heroCurrentIndex = (heroCurrentIndex + 1) % slidesCount;
    setHeroSlide(heroCurrentIndex);
  }, 5000);
}


function renderItems(items, container, options = {}) {
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }

  const compact = options.compact;
  const typeForWatchlist = currentType === 'all' ? 'movie' : currentType;
  const baseType = typeForWatchlist === 'anime' ? 'tv' : typeForWatchlist;

  container.innerHTML = items
    .map((item) => {
      const id = item.id;
      const isMovie = baseType === 'movie';
      const title = isMovie ? item.title : item.name;
      const date = isMovie ? item.release_date : item.first_air_date;
      const posterPath = item.poster_path;
      const rating = item.vote_average;
      const posterUrl = posterPath
        ? `${TMDB_IMAGE_BASE_URL}${posterPath}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

      const existing = watchlist.find(
        (entry) => entry.id === id && entry.type === getItemType(item),
      );
      const isInWatchlist = !!existing;
      const isFavorite = existing?.favorite || false;
      const heart = isFavorite ? '♥' : '♡';

      return `
        <article class="movie-card ${compact ? 'movie-card--compact' : ''}">
          <img src="${posterUrl}" alt="${title}" class="movie-poster" />
          <div class="movie-info">
            <h3>${title}</h3>
            <p class="movie-meta">
              <span>${date ? date.slice(0, 4) : 'Unknown'}</span>
              <span>⭐ ${rating ? rating.toFixed(1) : 'N/A'}</span>
            </p>
            <div class="card-actions" data-id="${id}">
              <button
                type="button"
                class="card-icon-btn card-icon-btn--watchlist"
                aria-label="Toggle watchlist"
              >
                ${isInWatchlist ? '✓ Added' : '+ Add Watchlist'}
              </button>
              <button
                type="button"
                class="card-icon-btn card-icon-btn--favorite ${
                  isFavorite ? 'card-icon-btn--favorite-active' : ''
                }"
                aria-label="Toggle favorite"
              >
                ${heart}
              </button>
              <button
                type="button"
                class="card-icon-btn card-icon-btn--more"
                aria-label="More details"
              >
                ⋯
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  const actionGroups = container.querySelectorAll('.card-actions');
  actionGroups.forEach((group) => {
    const id = Number(group.dataset.id);
    const item = items.find((it) => it.id === id);
    if (!item) return;

    const watchlistBtn = group.querySelector('.card-icon-btn--watchlist');
    const favoriteBtn = group.querySelector('.card-icon-btn--favorite');
    const moreBtn = group.querySelector('.card-icon-btn--more');

    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleWatchlistItem(item);
        renderItems(items, container, options);
      });
    }

    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (event) => {
        event.stopPropagation();

        const type = getItemType(item);
        let idx = watchlist.findIndex(
          (entry) => entry.id === id && entry.type === type,
        );

        if (idx === -1) {
          toggleWatchlistItem(item);
          idx = watchlist.findIndex(
            (entry) => entry.id === id && entry.type === type,
          );
        } else {
          watchlist[idx].favorite = !watchlist[idx].favorite;
          saveWatchlist();
        }

        renderItems(items, container, options);
        renderWatchlist();
        renderFavorites();
      });
    }

    if (moreBtn) {
      moreBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        openModal(item);
      });
    }
  });

  const cards = container.querySelectorAll('.movie-card');
  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.card-icon-btn')) return;

      const group = card.querySelector('.card-actions');
      if (!group) return;
      const id = Number(group.dataset.id);
      const item = items.find((it) => it.id === id);
      if (item) openModal(item);
    });
  });
}

// ---------- WATCHLIST ----------
function getItemType(item) {
  if (item.media_type) return item.media_type; 
  if (item.title) return 'movie';
  if (item.name) return 'tv';
  return currentType === 'anime' ? 'anime' : 'movie';
}

function toggleWatchlistItem(item) {
  const type = getItemType(item);
  const isMovie = type === 'movie';
  const id = item.id;
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;
  const posterPath = item.poster_path || item.backdrop_path || null;

  const existingIndex = watchlist.findIndex(
    (entry) => entry.id === id && entry.type === type,
  );

  if (existingIndex !== -1) {
    watchlist.splice(existingIndex, 1);
  } else {
    watchlist.push({
      id,
      type,
      title,
      date,
      posterPath,
      status: 'to-watch',
      favorite: false,
    });
  }

  saveWatchlist();
  renderWatchlist();
  renderFavorites();
}

function renderFavorites() {
  if (!favoritesListElement) return;

  const favorites = watchlist.filter((entry) => entry.favorite);

  if (favorites.length === 0) {
    favoritesListElement.innerHTML =
      '<li>No favorite titles yet.</li>';
    return;
  }

  favoritesListElement.innerHTML = favorites
    .map((entry) => {
      const year = entry.date ? entry.date.slice(0, 4) : 'N/A';
      const posterUrl = entry.posterPath
        ? `${TMDB_IMAGE_BASE_URL}${entry.posterPath}`
        : 'https://via.placeholder.com/96x144?text=No+Image';
      return `
        <li class="watchlist-item" data-id="${entry.id}" data-type="${entry.type}">
          <img src="${posterUrl}" alt="${entry.title}" class="watchlist-poster" />
          <div class="watchlist-meta">
            <span class="watchlist-meta-title">${entry.title}</span>
            <span class="watchlist-meta-sub">[${entry.type}] · ${year}</span>
          </div>
        </li>
      `;
    })
    .join('');
}

function renderWatchlist() {
  if (!watchlistElement) return;

  if (!watchlist || watchlist.length === 0) {
    watchlistElement.innerHTML = '<li>No items in your watchlist yet.</li>';
    return;
  }

  let filtered = watchlist;

  if (currentWatchlistFilter === 'favorite') {
    filtered = watchlist.filter((entry) => entry.favorite);
  } else if (currentWatchlistFilter) {
    filtered = watchlist.filter(
      (entry) => entry.status === currentWatchlistFilter,
    );
  }

  if (filtered.length === 0) {
    watchlistElement.innerHTML = '<li>No titles for this filter yet.</li>';
    return;
  }

  watchlistElement.innerHTML = filtered
    .map((entry) => {
      const year = entry.date ? entry.date.slice(0, 4) : 'N/A';
      const posterUrl = entry.posterPath
        ? `${TMDB_IMAGE_BASE_URL}${entry.posterPath}`
        : 'https://via.placeholder.com/96x144?text=No+Image';
      const heart = entry.favorite ? '♥' : '♡';

      return `
        <li class="watchlist-item" data-id="${entry.id}" data-type="${entry.type}">
          <img src="${posterUrl}" alt="${entry.title}" class="watchlist-poster" />
          <div class="watchlist-meta">
            <span class="watchlist-meta-title">${entry.title}</span>
            <span class="watchlist-meta-sub">[${entry.type}] · ${year}</span>
          </div>
          <div class="watchlist-actions">
            <button
              type="button"
              class="watchlist-fav-btn ${
                entry.favorite ? 'watchlist-fav-btn--active' : ''
              }"
              aria-label="Toggle favorite"
            >
              ${heart}
            </button>
            <button class="remove-btn" data-id="${entry.id}" data-type="${entry.type}">
              ✕
            </button>
          </div>
        </li>
      `;
    })
    .join('');

  const removeButtons = watchlistElement.querySelectorAll('.remove-btn');
  removeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const type = btn.dataset.type;
      watchlist = watchlist.filter(
        (entry) => !(entry.id === id && entry.type === type),
      );
      saveWatchlist();
      renderWatchlist();
      renderFavorites();
    });
  });

  const favButtons = watchlistElement.querySelectorAll('.watchlist-fav-btn');
  favButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.watchlist-item');
      if (!li) return;
      const id = Number(li.dataset.id);
      const type = li.dataset.type;

      const idx = watchlist.findIndex(
        (entry) => entry.id === id && entry.type === type,
      );
      if (idx === -1) return;

      watchlist[idx].favorite = !watchlist[idx].favorite;
      saveWatchlist();
      renderWatchlist();
      renderFavorites();
    });
  });
}

function saveWatchlist() {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
}

function loadWatchlist() {
  const stored = localStorage.getItem(WATCHLIST_KEY);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return parsed.map((entry) => ({
      ...entry,
      status: entry.status || 'to-watch',
      favorite: entry.favorite || false,
      posterPath: entry.posterPath || null,
    }));
  } catch {
    return [];
  }
}

// ---------- MODAL ----------
function setupModalHandlers() {
  if (modalCloseBtn && detailsModal) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  if (modalBackdrop && detailsModal) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  modalStatusButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!modalCurrentItem) return;
      const status = btn.dataset.modalStatus;
      setWatchlistStatus(modalCurrentItem, status);
      modalStatusButtons.forEach((b) =>
        b.classList.toggle('status-chip--active', b === btn),
      );
    });
  });

  if (modalFavoriteBtn) {
    modalFavoriteBtn.addEventListener('click', () => {
      if (!modalCurrentItem) return;

      const type = getItemType(modalCurrentItem);
      const id = modalCurrentItem.id;

      let idx = watchlist.findIndex(
        (entry) => entry.id === id && entry.type === type,
      );

      // If not in watchlist yet, add it first
      if (idx === -1) {
        toggleWatchlistItem(modalCurrentItem);
        idx = watchlist.findIndex(
          (entry) => entry.id === id && entry.type === type,
        );
      }

      if (idx !== -1) {
        watchlist[idx].favorite = !watchlist[idx].favorite;
        saveWatchlist();
        renderWatchlist();
        renderFavorites();

        const isFavNow = watchlist[idx].favorite;

        modalFavoriteBtn.classList.toggle(
          'modal-favorite-btn--active',
          isFavNow,
        );
        modalFavoriteBtn.textContent = isFavNow
          ? '♥ Favorited'
          : '♡ Add to favorites';
      }
    });
  }
}

async function openModal(item) {
  if (
    !detailsModal ||
    !modalPoster ||
    !modalTitle ||
    !modalMeta ||
    !modalOverview
  ) {
    console.error('Missing modal elements, cannot open modal');
    return;
  }

  modalCurrentItem = item;

  const type = getItemType(item);
  const isMovie = type === 'movie';

  const id = item.id;
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;
  const rating = item.vote_average;
  const overview = item.overview;
  const posterPath = item.poster_path;
  const posterUrl = posterPath
    ? `${TMDB_IMAGE_BASE_URL}${posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  modalPoster.src = posterUrl;
  modalPoster.alt = title;
  modalTitle.textContent = title;
  modalMeta.textContent = `${date ? date.slice(0, 4) : 'Unknown'} · ${
    rating ? rating.toFixed(1) + '⭐' : 'No rating'
  }`;
  modalOverview.textContent = overview || 'No description available.';

  const existing = watchlist.find(
    (entry) => entry.id === item.id && entry.type === type,
  );
  const isFav = existing?.favorite || false;

  if (modalFavoriteBtn) {
    modalFavoriteBtn.classList.toggle('modal-favorite-btn--active', isFav);
    modalFavoriteBtn.textContent = isFav
      ? '♥ Favorited'
      : '♡ Add to favorites';
  }

  if (modalTrailer) modalTrailer.innerHTML = '';
  if (modalCast) modalCast.innerHTML = '';

  detailsModal.classList.remove('modal--hidden');
  detailsModal.classList.add('modal--visible');

  const typePath = isMovie ? 'movie' : 'tv';
  const url = `${TMDB_BASE_URL}/${typePath}/${id}?append_to_response=videos,credits&language=en-US`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to load extra details');

    const data = await response.json();

    const videos = data.videos?.results || [];
    const trailer =
      videos.find(
        (v) =>
          v.type === 'Trailer' &&
          v.site === 'YouTube' &&
          v.official,
      ) ||
      videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
      videos.find((v) => v.site === 'YouTube');

    if (trailer && modalTrailer) {
      const trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      modalTrailer.innerHTML = `
        <a href="${trailerUrl}" target="_blank" rel="noopener noreferrer">
          ▶ Watch trailer
        </a>
      `;
    }

    const cast = data.credits?.cast || [];
    if (cast.length > 0 && modalCast) {
      const topCast = cast.slice(0, 5);
      const castNames = topCast
        .map((c) => `${c.name}${c.character ? ' as ' + c.character : ''}`)
        .join(', ');

      modalCast.innerHTML = `
        <strong>Cast</strong>
        <span>${castNames}</span>
      `;
    }
  } catch (error) {
    console.error(error);
  }
}

function closeModal() {
  if (!detailsModal) return;
  detailsModal.classList.remove('modal--visible');
  detailsModal.classList.add('modal--hidden');
  modalCurrentItem = null;
}

// ---------- STATUS ----------
function setWatchlistStatus(item, status) {
  const type = getItemType(item);
  const id = item.id;

  let index = watchlist.findIndex(
    (entry) => entry.id === id && entry.type === type,
  );

  if (index === -1) {
    toggleWatchlistItem(item);
    index = watchlist.findIndex(
      (entry) => entry.id === id && entry.type === type,
    );
  }

  if (index !== -1) {
    watchlist[index].status = status;
    saveWatchlist();
    renderWatchlist();
    renderFavorites();
  }
}