// Explore page JavaScript
let searchTimeout;
let currentContentType = 'anime';

document.addEventListener('DOMContentLoaded', function() {
    setupContentToggle();
    
    // Check for URL parameters (global search)
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
        searchContent(queryParam);
    } else {
        // Load only anime initially
        loadTopAnime();
        loadPopularAnime();
        loadAiringAnime();
    }
    
    // Handle global search from navbar
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    searchContent(query);
                }
            }
        });
    }
});

function setupContentToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => switchContentType(btn.dataset.type));
    });
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
    
    // Show/hide content sections
    document.querySelectorAll('.content-section').forEach(section => {
        const sectionType = section.dataset.type;
        section.style.display = sectionType === type ? 'block' : 'none';
    });
    
    // Lazy load manga data
    if (type === 'manga') {
        const topGrid = document.getElementById('top-manga-grid');
        if (!topGrid.children.length) {
            loadTopManga();
            loadPopularManga();
            loadPublishingManga();
        }
    }
}

async function loadTopAnime() {
    const grid = document.getElementById('top-anime-grid');
    try {
        showLoadingGrid(grid);
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=12');
        const data = await response.json();
        displayAnimeGrid(data.data, 'top-anime-grid', 'anime');
    } catch (error) {
        console.error('Error loading top anime:', error);
        showErrorState(grid, 'Failed to load top anime');
    }
}

async function loadPopularAnime() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/anime?order_by=popularity&limit=12');
        const data = await response.json();
        displayAnimeGrid(data.data, 'popular-anime-grid', 'anime');
    } catch (error) {
        console.error('Error loading popular anime:', error);
    }
}

async function loadAiringAnime() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/anime?status=airing&limit=12');
        const data = await response.json();
        displayAnimeGrid(data.data, 'airing-anime-grid', 'anime');
    } catch (error) {
        console.error('Error loading airing anime:', error);
    }
}



async function searchContent(query) {
    document.querySelectorAll('.anime-section').forEach(section => {
        if (section.id !== 'search-results-section') {
            section.style.display = 'none';
        }
    });
    
    const searchSection = document.getElementById('search-results-section');
    const resultsGrid = document.getElementById('search-results');
    
    searchSection.style.display = 'block';
    showLoadingGrid(resultsGrid);
    
    try {
        const endpoint = currentContentType === 'anime' ? 'anime' : 'manga';
        const response = await fetch(`https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=24`);
        const data = await response.json();
        
        if (data.data.length === 0) {
            resultsGrid.innerHTML = `<div class="empty-state">No ${currentContentType} found. Try a different search term.</div>`;
        } else {
            displayAnimeGrid(data.data, 'search-results', currentContentType);
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i> Search failed. Please try again.</div>';
    }
}

function displayAnimeGrid(itemList, gridId, type = 'anime') {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    
    itemList.forEach(item => {
        const card = createAnimeCard(item, type);
        grid.appendChild(card);
    });
}

function createAnimeCard(item, type = 'anime') {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.onclick = () => window.location.href = `details.html?id=${item.mal_id}&type=${type}`;
    
    const img = document.createElement('img');
    img.src = item.images?.jpg?.image_url || '';
    img.alt = item.title || (type === 'anime' ? 'Anime' : 'Manga');
    img.className = 'anime-poster';
    
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
        readBtn.innerHTML = '<i class="fas fa-book-open"></i>';
        readBtn.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `reader.html?title=${encodeURIComponent(item.title)}`;
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

// Loading states
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

// Manga API functions
async function loadTopManga() {
    const grid = document.getElementById('top-manga-grid');
    try {
        showLoadingGrid(grid);
        const response = await fetch('https://api.jikan.moe/v4/top/manga?limit=12');
        const data = await response.json();
        displayAnimeGrid(data.data, 'top-manga-grid', 'manga');
    } catch (error) {
        console.error('Error loading top manga:', error);
        showErrorState(grid, 'Failed to load top manga');
    }
}

async function loadPopularManga() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/manga?order_by=popularity&limit=12');
        const data = await response.json();
        displayAnimeGrid(data.data, 'popular-manga-grid', 'manga');
    } catch (error) {
        console.error('Error loading popular manga:', error);
    }
}

async function loadPublishingManga() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/manga?status=publishing&limit=12');
        const data = await response.json();
        displayAnimeGrid(data.data, 'publishing-manga-grid', 'manga');
    } catch (error) {
        console.error('Error loading publishing manga:', error);
    }
}