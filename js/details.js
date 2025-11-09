// Details page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type') || 'anime';
    
    if (id) {
        fetchDetails(id, type);
    } else {
        showError('No ID provided');
    }
});

async function fetchDetails(id, type) {
    const container = document.getElementById('anime-details');
    
    try {
        showLoadingDetails(container);
        const endpoint = type === 'manga' ? 'manga' : 'anime';
        const response = await fetch(`https://api.jikan.moe/v4/${endpoint}/${id}`);
        const data = await response.json();
        displayDetails(data.data, type);
    } catch (error) {
        console.error(`Error fetching ${type} details:`, error);
        showError(`Failed to load ${type} details`);
    }
}

function displayDetails(item, type) {
    document.title = `OtakuBoxd - ${item.title}`;
    const isInList = checkIfInList(item.mal_id);
    
    const detailsContainer = document.getElementById('anime-details');
    detailsContainer.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'details-container';
    
    const img = document.createElement('img');
    img.src = item.images?.jpg?.large_image_url || '';
    img.alt = item.title || (type === 'anime' ? 'Anime' : 'Manga');
    img.className = 'details-poster';
    
    const info = document.createElement('div');
    info.className = 'details-info';
    
    const title = document.createElement('h1');
    title.className = 'details-title';
    title.textContent = item.title || 'Unknown Title';
    
    const meta = document.createElement('div');
    meta.className = 'details-meta';
    
    const score = document.createElement('span');
    score.className = 'details-score';
    score.textContent = `★ ${item.score || 'N/A'}`;
    
    const episodes = document.createElement('span');
    episodes.className = 'details-episodes';
    episodes.textContent = type === 'anime' 
        ? `${item.episodes || '?'} eps`
        : `${item.chapters || '?'} ch`;
    
    const status = document.createElement('span');
    status.className = 'details-status';
    status.textContent = item.status || 'Unknown';
    
    const year = document.createElement('span');
    year.className = 'details-year';
    year.textContent = item.year || item.published?.from?.split('-')[0] || 'N/A';
    
    meta.appendChild(score);
    meta.appendChild(episodes);
    meta.appendChild(status);
    meta.appendChild(year);
    
    const genres = document.createElement('div');
    genres.className = 'details-genres';
    if (item.genres) {
        item.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre.name;
            genres.appendChild(tag);
        });
    }
    
    const synopsis = document.createElement('p');
    synopsis.className = 'details-synopsis';
    synopsis.textContent = item.synopsis || 'No synopsis available.';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '1rem';
    
    const button = document.createElement('button');
    button.className = 'add-to-list-btn';
    button.id = 'add-to-list';
    button.textContent = isInList ? 'Edit Rating' : 'Add to My List';
    if (isInList) {
        button.style.backgroundColor = '#6b7280';
        button.onclick = () => editRating(item.mal_id);
    } else {
        button.onclick = () => showRatingModal(item.mal_id, item.title, item.images?.jpg?.image_url);
    }
    
    // Add read button for manga
    if (type === 'manga') {
        const readBtn = document.createElement('button');
        readBtn.className = 'add-to-list-btn';
        readBtn.style.backgroundColor = '#10b981';
        readBtn.innerHTML = '<i class="fas fa-book-open"></i> Read Manga';
        readBtn.onclick = () => window.location.href = `reader.html?title=${encodeURIComponent(item.title)}`;
        buttonsContainer.appendChild(readBtn);
    }
    
    buttonsContainer.appendChild(button);
    
    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(genres);
    info.appendChild(synopsis);
    info.appendChild(buttonsContainer);
    
    container.appendChild(img);
    container.appendChild(info);
    detailsContainer.appendChild(container);
    
    createRatingModal();
}

function createRatingModal() {
    const modal = document.createElement('div');
    modal.id = 'rating-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    
    const title = document.createElement('h3');
    title.textContent = 'Rate this Item';
    
    const rating = document.createElement('div');
    rating.className = 'star-rating';
    rating.id = 'star-rating';
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.dataset.rating = i;
        star.textContent = '★';
        rating.appendChild(star);
    }
    
    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = saveRating;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = closeModal;
    
    buttons.appendChild(saveBtn);
    buttons.appendChild(cancelBtn);
    
    content.appendChild(title);
    content.appendChild(rating);
    content.appendChild(buttons);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
}

// Legacy function - now handled by rating modal

function checkIfInList(id) {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'anime';
    const listKey = type === 'anime' ? 'animeList' : 'mangaList';
    const myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    return myList.some(item => item.id === id);
}

let currentAnime = null;
let selectedRating = 0;

function showRatingModal(id, title, image) {
    currentAnime = { id, title, image };
    selectedRating = 0;
    document.getElementById('rating-modal').style.display = 'flex';
    updateStars();
}

function editRating(id) {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'anime';
    const listKey = type === 'anime' ? 'animeList' : 'mangaList';
    const myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    const item = myList.find(a => a.id === id);
    if (item) {
        currentAnime = item;
        selectedRating = item.rating || 0;
        document.getElementById('rating-modal').style.display = 'flex';
        updateStars();
    }
}

function closeModal() {
    document.getElementById('rating-modal').style.display = 'none';
    currentAnime = null;
    selectedRating = 0;
}

function saveRating() {
    if (currentAnime && selectedRating > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'anime';
        const listKey = type === 'anime' ? 'animeList' : 'mangaList';
        
        let myList = JSON.parse(localStorage.getItem(listKey) || '[]');
        const existingIndex = myList.findIndex(item => item.id === currentAnime.id);
        
        const itemWithRating = {
            id: currentAnime.id,
            title: currentAnime.title,
            image: currentAnime.image,
            rating: selectedRating
        };
        
        if (existingIndex >= 0) {
            myList[existingIndex] = itemWithRating;
        } else {
            myList.push(itemWithRating);
        }
        
        localStorage.setItem(listKey, JSON.stringify(myList));
        closeModal();
        
        const btn = document.getElementById('add-to-list');
        btn.textContent = 'Added to List!';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            btn.textContent = 'Edit Rating';
            btn.style.backgroundColor = '#6b7280';
        }, 2000);
    }
}

// Star rating functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('star')) {
        selectedRating = parseInt(e.target.dataset.rating);
        updateStars();
    }
});

function updateStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.style.color = '#fbbf24';
        } else {
            star.style.color = '#374151';
        }
    });
}

function showLoadingDetails(container) {
    container.innerHTML = `
        <div class="details-container">
            <div class="skeleton-poster"></div>
            <div class="details-info">
                <div class="skeleton-title"></div>
                <div class="skeleton-meta"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
    `;
}

function showError(message) {
    const detailsContainer = document.getElementById('anime-details');
    detailsContainer.innerHTML = '';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'empty-state';
    
    const errorMsg = document.createElement('p');
    errorMsg.textContent = message;
    
    const backLink = document.createElement('a');
    backLink.href = 'index.html';
    backLink.className = 'back-btn';
    backLink.textContent = '← Back to Home';
    
    errorDiv.appendChild(errorMsg);
    errorDiv.appendChild(backLink);
    detailsContainer.appendChild(errorDiv);
}