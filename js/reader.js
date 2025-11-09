document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaTitle = urlParams.get('title');
    
    if (mangaTitle) {
        loadMangaReader(mangaTitle);
    } else {
        showError('No manga specified');
    }
});

function loadMangaReader(title) {
    const container = document.querySelector('.reader-container');
    const searchQuery = encodeURIComponent(title);
    
    const sources = [
        { name: 'MangaReader', url: `https://mangareader.to/search?keyword=${searchQuery}` },
        { name: 'MangaDex', url: `https://mangadex.org/search?q=${searchQuery}` },
        { name: 'Manganato', url: `https://manganato.com/search/story/${searchQuery}` }
    ];
    
    container.innerHTML = `
        <div class="reader-header">
            <h2>📖 ${title}</h2>
            <p>Choose a manga source to read:</p>
        </div>
        <div class="source-grid">
            ${sources.map(source => `
                <a href="${source.url}" target="_blank" class="source-btn">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Read on ${source.name}</span>
                </a>
            `).join('')}
        </div>
        <div class="reader-footer">
            <a href="mylist.html" class="back-btn">← Back to My List</a>
        </div>
    `;
}

function showError(message) {
    const container = document.querySelector('.reader-container');
    container.innerHTML = `
        <div class="empty-state">
            <p>${message}</p>
            <a href="mylist.html" class="back-btn">← Back to My List</a>
        </div>
    `;
}