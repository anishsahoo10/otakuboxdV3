// Clean OtakuBoxd Web App
let cachedAnime = null;
let cachedManga = null;
let searchTimeout;
let currentContentType = 'anime';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    fetchTopAnime();
    fetchPopularAnime();
    fetchAiringAnime();
    setupScrollEffects();
    // Load manga only when needed
}

function setupEventListeners() {
    // Content type toggle
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => switchContentType(btn.dataset.type));
    });
    
    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
        globalSearch.addEventListener('focus', showSearchSuggestions);
        globalSearch.addEventListener('blur', hideSearchSuggestions);
    }
    
    // Mobile menu
    const mobileToggle = document.getElementById('mobile-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Scroll to top
    const scrollTop = document.getElementById('scroll-top');
    if (scrollTop) {
        scrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function handleGlobalSearch() {
    const query = document.getElementById('global-search').value.trim();
    clearTimeout(searchTimeout);
    
    if (query.length > 2) {
        searchTimeout = setTimeout(() => {
            fetchSearchSuggestions(query);
        }, 300);
    } else {
        hideSearchSuggestions();
    }
}

async function fetchSearchSuggestions(query) {
    try {
        const endpoint = currentContentType === 'anime' ? 'anime' : 'manga';
        const response = await fetch(`https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        displaySearchSuggestions(data.data);
    } catch (error) {
        console.error('Search suggestions error:', error);
    }
}

function displaySearchSuggestions(suggestions) {
    const container = document.getElementById('search-suggestions');
    if (!container) return;
    
    container.innerHTML = '';
    
    suggestions.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        const metaText = currentContentType === 'anime' 
            ? `★ ${item.score || 'N/A'} • ${item.episodes || '?'} eps`
            : `★ ${item.score || 'N/A'} • ${item.chapters || '?'} ch`;
        
        suggestionItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.images.jpg.small_image_url}" alt="${item.title}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 5px;">
                <div>
                    <div style="font-weight: 500; color: var(--light);">${item.title}</div>
                    <div style="font-size: 0.8rem; color: var(--gray);">${metaText}</div>
                </div>
            </div>
        `;
        suggestionItem.addEventListener('click', () => {
            window.location.href = `details.html?id=${item.mal_id}&type=${currentContentType}`;
        });
        container.appendChild(suggestionItem);
    });
    
    container.style.display = 'block';
}

function showSearchSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container && container.children.length > 0) {
        container.style.display = 'block';
    }
}

function hideSearchSuggestions() {
    setTimeout(() => {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }, 200);
}



async function fetchPopularAnime() {
    const grid = document.getElementById('popular-grid');
    try {
        showLoadingGrid(grid);
        const data = await cachedFetch('https://api.jikan.moe/v4/anime?order_by=popularity&limit=12', 'popular-anime');
        displayAnimeGrid(data.data, 'popular-grid');
    } catch (error) {
        console.error('Error fetching popular anime:', error);
        showErrorState(grid, 'Failed to load popular anime');
    }
}

async function fetchAiringAnime() {
    const grid = document.getElementById('airing-grid');
    try {
        showLoadingGrid(grid);
        const data = await cachedFetch('https://api.jikan.moe/v4/anime?status=airing&limit=12', 'airing-anime');
        displayAnimeGrid(data.data, 'airing-grid');
    } catch (error) {
        console.error('Error fetching airing anime:', error);
        showErrorState(grid, 'Failed to load airing anime');
    }
}

function displayAnimeGrid(animeList, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = '';
    
    animeList.forEach(anime => {
        const card = createAnimeCard(anime);
        grid.appendChild(card);
    });
}

async function fetchTopAnime() {
    const container = document.getElementById('trending-container');
    
    try {
        showLoadingState(container);
        const data = await cachedFetch('https://api.jikan.moe/v4/top/anime?limit=24', 'top-anime');
        
        const shuffled = shuffleArray([...data.data]);
        displayTrendingAnime(shuffled.slice(0, 12));
        cachedAnime = data.data;
    } catch (error) {
        console.error('Error fetching anime:', error);
        showErrorState(container, 'Failed to load anime');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayTrendingAnime(animeList) {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = 'flex';
    
    animeList.forEach((anime, index) => {
        const card = createTrendingCard(anime, index + 1);
        container.appendChild(card);
    });
}

function createTrendingCard(anime, rank) {
    const card = document.createElement('div');
    card.className = 'trending-card';
    card.onclick = () => navigateToDetails(anime.mal_id);
    
    const img = document.createElement('img');
    img.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    img.alt = anime.title || 'Anime';
    img.className = 'trending-poster';
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'trending-info';
    
    const title = document.createElement('h3');
    title.className = 'trending-title';
    title.textContent = anime.title || 'Unknown Title';
    
    const rating = document.createElement('div');
    rating.className = 'trending-rating';
    
    const star = document.createElement('i');
    star.className = 'fas fa-star';
    
    rating.appendChild(star);
    rating.appendChild(document.createTextNode(anime.score || 'N/A'));
    
    info.appendChild(title);
    info.appendChild(rating);
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

function createAnimeCard(item, type = 'anime') {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.onclick = () => navigateToDetails(item.mal_id, type);
    
    const img = document.createElement('img');
    img.src = item.images?.jpg?.large_image_url || '';
    img.alt = item.title || (type === 'anime' ? 'Anime' : 'Manga');
    img.className = 'anime-poster';
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'anime-info';
    
    const title = document.createElement('h3');
    title.className = 'anime-title';
    title.textContent = item.title || 'Unknown Title';
    
    const meta = document.createElement('div');
    meta.className = 'anime-meta';
    
    const score = document.createElement('span');
    score.className = 'anime-score';
    score.textContent = `★ ${item.score || 'N/A'}`;
    
    const episodes = document.createElement('span');
    episodes.className = 'anime-episodes';
    episodes.textContent = type === 'anime' 
        ? `${item.episodes || '?'} eps`
        : `${item.chapters || '?'} ch`;
    
    // Add read button for manga
    if (type === 'manga') {
        const readBtn = document.createElement('button');
        readBtn.className = 'read-btn';
        readBtn.innerHTML = '<i class="fas fa-book-open"></i> Read';
        readBtn.onclick = (e) => {
            e.stopPropagation();
            openMangaReader(item.title);
        };
        info.appendChild(readBtn);
    }
    
    meta.appendChild(score);
    meta.appendChild(episodes);
    info.appendChild(title);
    info.appendChild(meta);
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

function navigateToDetails(id, type = currentContentType) {
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        window.location.href = `details.html?id=${id}&type=${type}`;
    }, 200);
}

function showRandomAnime() {
    const cache = currentContentType === 'anime' ? cachedAnime : cachedManga;
    if (cache && cache.length > 0) {
        const randomItem = cache[Math.floor(Math.random() * cache.length)];
        navigateToDetails(randomItem.mal_id);
    }
}

function setupScrollEffects() {
    const fab = document.getElementById('scroll-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            fab.classList.add('show');
        } else {
            fab.classList.remove('show');
        }
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = element.textContent;
    const number = parseInt(target.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const step = number / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= number) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        }
    }, 16);
}

function toggleMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    const toggle = document.getElementById('mobile-toggle');
    
    menu.classList.toggle('mobile-active');
    toggle.classList.toggle('active');
}





// Optimized Manga API functions
async function fetchTopManga() {
    try {
        const data = await cachedFetch('https://api.jikan.moe/v4/top/manga?limit=12', 'top-manga');
        displayTrendingAnime(data.data, 'top-manga-container');
        cachedManga = data.data;
    } catch (error) {
        console.error('Error fetching top manga:', error);
    }
}

async function fetchPopularManga() {
    try {
        const data = await cachedFetch('https://api.jikan.moe/v4/manga?order_by=popularity&limit=12', 'popular-manga');
        displayAnimeGrid(data.data, 'popular-manga-grid', 'manga');
    } catch (error) {
        console.error('Error fetching popular manga:', error);
    }
}

async function fetchPublishingManga() {
    try {
        const data = await cachedFetch('https://api.jikan.moe/v4/manga?status=publishing&limit=12', 'publishing-manga');
        displayAnimeGrid(data.data, 'publishing-manga-grid', 'manga');
    } catch (error) {
        console.error('Error fetching publishing manga:', error);
    }
}

function switchContentType(type) {
    currentContentType = type;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    // Update search placeholder
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.placeholder = `Search ${type}...`;
    }
    
    // Smooth transition for content sections
    document.querySelectorAll('.content-section').forEach(section => {
        const sectionType = section.dataset.type;
        if (sectionType === type) {
            section.style.display = 'block';
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            setTimeout(() => {
                section.style.transition = 'all 0.3s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 50);
        } else {
            section.style.opacity = '0';
            section.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                section.style.display = 'none';
            }, 300);
        }
    });
    
    // Load manga data only when switching to manga
    if (type === 'manga' && !cachedManga) {
        fetchTopManga();
        fetchPopularManga();
        fetchPublishingManga();
    }
    
    // Update hero button text
    const heroBtn = document.querySelector('.btn-secondary');
    if (heroBtn) {
        heroBtn.innerHTML = `<i class="fas fa-shuffle"></i> Random ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }
}

function displayAnimeGrid(itemList, gridId, type = 'anime') {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = '';
    
    itemList.forEach((item, index) => {
        const card = createAnimeCard(item, type);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
}

function displayTrendingAnime(itemList, containerId = 'trending-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = 'flex';
    
    itemList.forEach((item, index) => {
        const card = createTrendingCard(item, index + 1, containerId.includes('manga') ? 'manga' : 'anime');
        card.style.animationDelay = `${index * 0.15}s`;
        container.appendChild(card);
    });
}

function createTrendingCard(item, rank, type = 'anime') {
    const card = document.createElement('div');
    card.className = 'trending-card';
    card.onclick = () => navigateToDetails(item.mal_id, type);
    
    const img = document.createElement('img');
    img.src = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '';
    img.alt = item.title || (type === 'anime' ? 'Anime' : 'Manga');
    img.className = 'trending-poster';
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'trending-info';
    
    const title = document.createElement('h3');
    title.className = 'trending-title';
    title.textContent = item.title || 'Unknown Title';
    
    const rating = document.createElement('div');
    rating.className = 'trending-rating';
    
    const star = document.createElement('i');
    star.className = 'fas fa-star';
    
    rating.appendChild(star);
    rating.appendChild(document.createTextNode(item.score || 'N/A'));
    
    info.appendChild(title);
    info.appendChild(rating);
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

// Manga reading functionality
function openMangaReader(title) {
    // Open MangaDex search in new tab
    const searchQuery = encodeURIComponent(title);
    window.open(`https://mangadex.org/search?q=${searchQuery}`, '_blank');
}

// Optimized API calls with caching
const apiCache = new Map();

async function cachedFetch(url, cacheKey) {
    if (apiCache.has(cacheKey)) {
        return apiCache.get(cacheKey);
    }
    
    const response = await fetch(url);
    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
}

// Loading states
function showLoadingState(container) {
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
}

function showLoadingGrid(grid) {
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        grid.appendChild(skeleton);
    }
}

function showErrorState(container, message) {
    container.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
}

// Global functions
window.showRandomAnime = showRandomAnime;
window.navigateToDetails = navigateToDetails;
window.navigateToFeatured = navigateToFeatured;
window.switchContentType = switchContentType;
window.openMangaReader = openMangaReader;