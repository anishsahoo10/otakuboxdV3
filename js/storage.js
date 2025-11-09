// localStorage functions for My List
let currentListType = 'anime';

document.addEventListener('DOMContentLoaded', function() {
    setupToggle();
    loadMyList();
});

function setupToggle() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => switchListType(btn.dataset.type));
    });
}

function switchListType(type) {
    currentListType = type;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    document.getElementById('list-type').textContent = type.charAt(0).toUpperCase() + type.slice(1);
    
    loadMyList();
}

function loadMyList() {
    const listKey = currentListType === 'anime' ? 'animeList' : 'mangaList';
    const myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    const grid = document.getElementById('mylist-grid');
    
    if (myList.length === 0) {
        grid.innerHTML = '';
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        const message = document.createElement('p');
        message.textContent = `Your ${currentListType} list is empty. Start adding ${currentListType}!`;
        
        const link = document.createElement('a');
        link.href = 'search.html';
        link.className = 'back-btn';
        link.textContent = `Browse ${currentListType.charAt(0).toUpperCase() + currentListType.slice(1)}`;
        
        emptyState.appendChild(message);
        emptyState.appendChild(link);
        grid.appendChild(emptyState);
    } else {
        displayMyList(myList);
    }
}

function displayMyList(itemList) {
    const grid = document.getElementById('mylist-grid');
    grid.innerHTML = '';
    
    itemList.forEach(item => {
        const card = createMyListCard(item);
        grid.appendChild(card);
    });
}

function createMyListCard(item) {
    const card = document.createElement('div');
    card.className = 'anime-card mylist-card';
    
    const img = document.createElement('img');
    img.src = item.image || '';
    img.alt = item.title || (currentListType === 'anime' ? 'Anime' : 'Manga');
    img.className = 'anime-poster';
    img.onclick = () => window.location.href = `details.html?id=${item.id}&type=${currentListType}`;
    
    const info = document.createElement('div');
    info.className = 'anime-info';
    
    const title = document.createElement('h3');
    title.className = 'anime-title';
    title.textContent = item.title || 'Unknown Title';
    title.onclick = () => window.location.href = `details.html?id=${item.id}&type=${currentListType}`;
    
    const rating = document.createElement('div');
    rating.className = 'user-rating';
    rating.textContent = 'Your Rating: ';
    
    const stars = document.createElement('span');
    stars.className = 'rating-stars';
    const userRating = item.rating ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) : 'Not rated';
    stars.textContent = userRating;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeFromList(item.id);
    
    // Add read button for manga
    if (currentListType === 'manga') {
        const readBtn = document.createElement('button');
        readBtn.className = 'remove-btn';
        readBtn.style.backgroundColor = '#10b981';
        readBtn.innerHTML = '<i class="fas fa-book-open"></i> Read';
        readBtn.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `reader.html?title=${encodeURIComponent(item.title)}`;
        };
        info.appendChild(readBtn);
    }
    
    rating.appendChild(stars);
    info.appendChild(title);
    info.appendChild(rating);
    info.appendChild(removeBtn);
    
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

function removeFromList(itemId) {
    const listKey = currentListType === 'anime' ? 'animeList' : 'mangaList';
    let myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    myList = myList.filter(item => item.id !== itemId);
    localStorage.setItem(listKey, JSON.stringify(myList));
    loadMyList(); // Refresh the display
}

// Export functions for use in other pages
window.addToMyList = function(id, title, image, type = 'anime') {
    const listKey = type === 'anime' ? 'animeList' : 'mangaList';
    let myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    
    if (!myList.find(item => item.id === id)) {
        myList.push({ id, title, image, type });
        localStorage.setItem(listKey, JSON.stringify(myList));
        return true;
    }
    return false;
};

window.isInMyList = function(id, type = 'anime') {
    const listKey = type === 'anime' ? 'animeList' : 'mangaList';
    const myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    return myList.some(item => item.id === id);
};