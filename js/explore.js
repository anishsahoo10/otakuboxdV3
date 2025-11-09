// 🌸 Enhanced Explore Page
let currentTab = 'trending';
let currentPage = 1;
let isLoading = false;
let searchTimeout;

document.addEventListener('DOMContentLoaded', function() {
    setupExploreTabs();
    setupFilters();
    setupInfiniteScroll();
    setupLiveSearch();
    loadRecentSearches();
    loadContent();
});

function setupExploreTabs() {
    const tabs = document.querySelectorAll('.explore-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            currentPage = 1;
            document.getElementById('content-grid').innerHTML = '';
            loadContent();
        });
    });
}

function setupFilters() {
    const filters = document.querySelectorAll('#type-filter, #year-filter, #score-filter');
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            currentPage = 1;
            document.getElementById('content-grid').innerHTML = '';
            loadContent();
        });
    });
}

function setupInfiniteScroll() {
    window.addEventListener('scroll', function() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            if (!isLoading) {
                loadMoreContent();
            }
        }
    });
}

function setupLiveSearch() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            clearTimeout(searchTimeout);
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    showLiveSearchResults(query);
                }, 300);
            } else {
                hideLiveSearchResults();
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    saveRecentSearch(query);
                    performSearch(query);
                }
            }
        });
    }
}

async function showLiveSearchResults(query) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        displayLiveSearchResults(data.data);
    } catch (error) {
        console.error('Live search error:', error);
    }
}

function displayLiveSearchResults(results) {
    const searchContainer = document.querySelector('.search-container');
    let dropdown = document.querySelector('.search-dropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        searchContainer.appendChild(dropdown);
    }
    
    dropdown.innerHTML = '';
    
    results.forEach(anime => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <img src="${anime.images.jpg.small_image_url}" alt="${anime.title}" class="search-result-img">
            <div class="search-result-info">
                <h4>${anime.title}</h4>
                <p>★ ${anime.score || 'N/A'} • ${anime.episodes || '?'} eps</p>
            </div>
        `;
        item.addEventListener('click', () => {
            openAnimeModal(anime);
            hideLiveSearchResults();
        });
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}

function hideLiveSearchResults() {
    const dropdown = document.querySelector('.search-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

async function loadContent() {
    if (isLoading) return;
    isLoading = true;
    
    const grid = document.getElementById('content-grid');
    if (currentPage === 1) {
        grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    }
    
    try {
        let url = getApiUrl();
        const response = await fetch(url);
        const data = await response.json();
        
        if (currentPage === 1) {
            grid.innerHTML = '';
        }
        
        data.data.forEach(item => {
            const card = createEnhancedCard(item);
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading content:', error);
        grid.innerHTML = '<div class="error-state">Failed to load content</div>';
    }
    
    isLoading = false;
}

function loadMoreContent() {
    currentPage++;
    document.getElementById('loading-more').style.display = 'block';
    loadContent().then(() => {
        document.getElementById('loading-more').style.display = 'none';
    });
}

function getApiUrl() {
    const typeFilter = document.getElementById('type-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const scoreFilter = document.getElementById('score-filter').value;
    
    let baseUrl = 'https://api.jikan.moe/v4/';
    let params = new URLSearchParams();
    
    switch (currentTab) {
        case 'trending':
            baseUrl += 'top/anime';
            break;
        case 'upcoming':
            baseUrl += 'seasons/upcoming';
            break;
        case 'popular':
            baseUrl += 'anime';
            params.append('order_by', 'popularity');
            break;
        case 'top-manga':
            baseUrl += 'top/manga';
            break;
    }
    
    params.append('page', currentPage);
    params.append('limit', 20);
    
    if (typeFilter) params.append('type', typeFilter);
    if (yearFilter) params.append('start_date', yearFilter);
    if (scoreFilter) params.append('min_score', scoreFilter);
    
    return baseUrl + '?' + params.toString();
}

function createEnhancedCard(item) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    
    card.innerHTML = `
        <img src="${item.images.jpg.image_url}" alt="${item.title}" class="anime-poster">
        <div class="anime-info">
            <h3 class="anime-title">${item.title}</h3>
            <div class="anime-meta">
                <span class="anime-score">★ ${item.score || 'N/A'}</span>
                <span class="anime-episodes">${item.episodes || item.chapters || '?'} ${item.episodes ? 'eps' : 'ch'}</span>
            </div>
        </div>
        <div class="card-overlay">
            <i class="fas fa-play-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <p>Click to view details</p>
        </div>
    `;
    
    card.addEventListener('click', () => openAnimeModal(item));
    
    return card;
}

function openAnimeModal(anime) {
    const modal = document.createElement('div');
    modal.className = 'anime-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header" style="background-image: url('${anime.images.jpg.large_image_url}')">
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <h2 class="modal-title">${anime.title}</h2>
                <div class="modal-meta">
                    <span>★ ${anime.score || 'N/A'}</span>
                    <span>${anime.episodes || anime.chapters || '?'} ${anime.episodes ? 'Episodes' : 'Chapters'}</span>
                    <span>${anime.status || 'Unknown'}</span>
                    <span>${anime.year || 'N/A'}</span>
                </div>
                <div class="modal-synopsis">
                    ${anime.synopsis || 'No synopsis available.'}
                </div>
                ${anime.trailer?.url ? `
                    <div class="trailer-container">
                        <h3>Trailer</h3>
                        <iframe src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen></iframe>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function saveRecentSearch(query) {
    let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    recent = recent.filter(item => item !== query);
    recent.unshift(query);
    recent = recent.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    loadRecentSearches();
}

function loadRecentSearches() {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const container = document.getElementById('recent-searches-list');
    if (container) {
        container.innerHTML = '';
        recent.forEach(search => {
            const item = document.createElement('span');
            item.className = 'recent-search-item';
            item.textContent = search;
            item.addEventListener('click', () => {
                document.getElementById('global-search').value = search;
                performSearch(search);
            });
            container.appendChild(item);
        });
    }
}

function performSearch(query) {
    // Implement search functionality
    console.log('Searching for:', query);
}