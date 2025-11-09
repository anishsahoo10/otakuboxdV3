// Gallery functionality
let currentCategory = 'characters';
let currentImages = [];
let currentModalImage = '';

document.addEventListener('DOMContentLoaded', function() {
    setupGallery();
    loadImages();
    setupInfiniteScroll();
});

function setupGallery() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCategory(btn.dataset.category));
    });
    
    // Refresh button
    document.getElementById('refresh-gallery').addEventListener('click', () => {
        currentImages = [];
        loadImages();
    });
}

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadImages();
        }
    });
}

function switchCategory(category) {
    currentCategory = category;
    currentImages = [];
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Clear gallery and load new images
    document.getElementById('gallery-grid').innerHTML = '';
    loadImages();
}

let isLoading = false;

async function loadImages() {
    if (isLoading) return;
    isLoading = true;
    
    const grid = document.getElementById('gallery-grid');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    // Show loading
    if (currentImages.length === 0) {
        showLoadingState();
    } else {
        loadMoreContainer.style.display = 'block';
    }
    
    try {
        let newImages = [];
        
        if (currentCategory === 'characters') {
            newImages = await fetchCharacterImages();
        } else if (currentCategory === 'neko') {
            newImages = await fetchNekoImages();
        } else if (currentCategory === 'husbando') {
            newImages = await fetchHusbandoImages();
        }
        
        currentImages = [...currentImages, ...newImages];
        
        // Use displayImages for first load, appendNewImages for subsequent loads
        if (currentImages.length === newImages.length) {
            displayImages(currentImages);
        } else {
            appendNewImages(newImages);
        }
        
    } catch (error) {
        console.error('Error loading images:', error);
        showErrorState();
    }
    
    loadMoreContainer.style.display = 'none';
    isLoading = false;
}

async function fetchCharacterImages() {
    const promises = [];
    
    // Waifu.pics - 2 images
    for (let i = 0; i < 2; i++) {
        const waifuEndpoints = ['waifu', 'pat', 'hug', 'kiss', 'smile', 'happy', 'dance'];
        const randomEndpoint = waifuEndpoints[Math.floor(Math.random() * waifuEndpoints.length)];
        promises.push(
            fetch(`https://api.waifu.pics/sfw/${randomEndpoint}`)
                .then(res => res.json())
                .then(data => ({ url: data.url, type: 'character' }))
                .catch(() => null)
        );
    }
    
    // Nekos.best - 2 images
    for (let i = 0; i < 2; i++) {
        const nekoEndpoints = ['neko', 'kitsune', 'waifu'];
        const randomEndpoint = nekoEndpoints[Math.floor(Math.random() * nekoEndpoints.length)];
        promises.push(
            fetch(`https://nekos.best/api/v2/${randomEndpoint}`)
                .then(res => res.json())
                .then(data => ({ url: data.results[0].url, type: 'character' }))
                .catch(() => null)
        );
    }
    
    // Waifu.im - 2 images
    for (let i = 0; i < 2; i++) {
        promises.push(
            fetch('https://api.waifu.im/search/?included_tags=waifu&height=>=2000')
                .then(res => res.json())
                .then(data => ({ url: data.images[0].url, type: 'character' }))
                .catch(() => null)
        );
    }
    
    const results = await Promise.all(promises);
    return results.filter(img => img !== null);
}

async function fetchNekoImages() {
    const promises = [];
    
    // Waifu.pics neko - 3 images
    for (let i = 0; i < 3; i++) {
        promises.push(
            fetch('https://api.waifu.pics/sfw/neko')
                .then(res => res.json())
                .then(data => ({ url: data.url, type: 'neko' }))
                .catch(() => null)
        );
    }
    
    // Nekos.best neko - 3 images
    for (let i = 0; i < 3; i++) {
        promises.push(
            fetch('https://nekos.best/api/v2/neko')
                .then(res => res.json())
                .then(data => ({ url: data.results[0].url, type: 'neko' }))
                .catch(() => null)
        );
    }
    
    const results = await Promise.all(promises);
    return results.filter(img => img !== null);
}

async function fetchHusbandoImages() {
    const promises = [];
    
    // Nekos.best husbando - 3 images
    for (let i = 0; i < 3; i++) {
        promises.push(
            fetch('https://nekos.best/api/v2/husbando')
                .then(res => res.json())
                .then(data => ({ url: data.results[0].url, type: 'husbando' }))
                .catch(() => null)
        );
    }
    
    // Waifu.im male characters - 2 images
    for (let i = 0; i < 2; i++) {
        promises.push(
            fetch('https://api.waifu.im/search/?included_tags=male&height=>=2000')
                .then(res => res.json())
                .then(data => ({ url: data.images[0].url, type: 'husbando' }))
                .catch(() => null)
        );
    }
    
    // Fallback to action endpoints - 1 image
    const endpoints = ['pat', 'hug', 'smile'];
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    promises.push(
        fetch(`https://api.waifu.pics/sfw/${randomEndpoint}`)
            .then(res => res.json())
            .then(data => ({ url: data.url, type: 'husbando' }))
            .catch(() => null)
    );
    
    const results = await Promise.all(promises);
    return results.filter(img => img !== null);
}



function displayImages(images) {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    images.forEach((image, index) => {
        const imageCard = createImageCard(image, index);
        grid.appendChild(imageCard);
    });
}

function appendNewImages(newImages) {
    const grid = document.getElementById('gallery-grid');
    const startIndex = currentImages.length - newImages.length;
    
    newImages.forEach((image, index) => {
        const imageCard = createImageCard(image, startIndex + index);
        grid.appendChild(imageCard);
    });
}

function createImageCard(image, index) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.animationDelay = `${(index % 12) * 0.1}s`;
    
    card.innerHTML = `
        <div class="image-container">
            <img src="${image.url}" alt="${image.type}" loading="lazy" onclick="openModal('${image.url}')">
            <div class="image-overlay">
                <button class="overlay-btn" onclick="openModal('${image.url}')">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="overlay-btn" onclick="downloadImage('${image.url}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function showLoadingState() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'gallery-skeleton';
        grid.appendChild(skeleton);
    }
}

function showErrorState() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1;">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load images. Please try again.</p>
            <button class="btn-primary" onclick="loadImages()">Retry</button>
        </div>
    `;
}

function openModal(imageUrl) {
    currentModalImage = imageUrl;
    document.getElementById('modal-image').src = imageUrl;
    document.getElementById('image-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function downloadImage(url = currentModalImage) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `anime-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareImage() {
    if (navigator.share) {
        navigator.share({
            title: 'Anime Artwork',
            url: currentModalImage
        });
    } else {
        navigator.clipboard.writeText(currentModalImage);
        alert('Image URL copied to clipboard!');
    }
}