// Stats page JavaScript
let currentStatsType = 'anime';

document.addEventListener('DOMContentLoaded', function() {
    setupToggle();
    loadStats();
});

function setupToggle() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => switchStatsType(btn.dataset.type));
    });
}

function switchStatsType(type) {
    currentStatsType = type;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    document.getElementById('stats-type').textContent = type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById('episodes-label').textContent = type === 'anime' ? 'Episodes Watched' : 'Chapters Read';
    document.getElementById('studio-title').textContent = type === 'anime' ? 'Favorite Studios' : 'Favorite Authors';
    
    loadStats();
}

async function loadStats() {
    const listKey = currentStatsType === 'anime' ? 'animeList' : 'mangaList';
    const myList = JSON.parse(localStorage.getItem(listKey) || '[]');
    
    if (myList.length === 0) {
        showEmptyState();
        return;
    }
    
    showStatsLoading();
    
    const endpoint = currentStatsType === 'anime' ? 'anime' : 'manga';
    const detailedItems = await Promise.all(
        myList.map(async (item) => {
            try {
                const response = await fetch(`https://api.jikan.moe/v4/${endpoint}/${item.id}`);
                const data = await response.json();
                return { ...data.data, userRating: item.rating };
            } catch (error) {
                return null;
            }
        })
    );
    
    const validItems = detailedItems.filter(item => item !== null);
    
    displayOverviewStats(validItems);
    createCharts(validItems);
}

function displayOverviewStats(itemList) {
    const totalItems = itemList.length;
    const avgRating = (itemList.reduce((sum, item) => sum + item.userRating, 0) / totalItems).toFixed(1);
    const totalCount = itemList.reduce((sum, item) => {
        return sum + (currentStatsType === 'anime' ? (item.episodes || 0) : (item.chapters || 0));
    }, 0);
    
    document.getElementById('total-anime').textContent = totalItems;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('total-episodes').textContent = totalCount;
}

function createCharts(itemList) {
    // Reset charts grid
    document.querySelector('.charts-grid').innerHTML = `
        <div class="chart-card">
            <h3><i class="fas fa-star"></i> Rating Distribution</h3>
            <canvas id="ratingChart"></canvas>
        </div>
        
        <div class="chart-card">
            <h3><i class="fas fa-tags"></i> Top Genres</h3>
            <canvas id="genreChart"></canvas>
        </div>
        
        <div class="chart-card">
            <h3><i class="fas fa-building"></i> <span id="studio-title">${currentStatsType === 'anime' ? 'Favorite Studios' : 'Favorite Authors'}</span></h3>
            <canvas id="studioChart"></canvas>
        </div>
        
        <div class="chart-card">
            <h3><i class="fas fa-calendar"></i> Timeline</h3>
            <canvas id="timelineChart"></canvas>
        </div>
    `;
    
    setTimeout(() => {
        createRatingChart(itemList);
        createGenreChart(itemList);
        if (currentStatsType === 'anime') {
            createStudioChart(itemList);
        } else {
            createAuthorChart(itemList);
        }
        createTimelineChart(itemList);
    }, 100);
}

function createRatingChart(itemList) {
    const canvas = document.getElementById('ratingChart');
    if (!canvas) return;
    
    const ratings = [1, 2, 3, 4, 5];
    const counts = ratings.map(rating => 
        itemList.filter(item => item.userRating === rating).length
    );
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['1★', '2★', '3★', '4★', '5★'],
            datasets: [{
                data: counts,
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true, grid: { color: '#334155' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function createGenreChart(itemList) {
    const canvas = document.getElementById('genreChart');
    if (!canvas) return;
    
    const genreCounts = {};
    itemList.forEach(item => {
        item.genres?.forEach(genre => {
            genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });
    });
    
    const sortedGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6);
    
    if (sortedGenres.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No genre data available</p>';
        return;
    }
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: sortedGenres.map(([genre]) => genre),
            datasets: [{
                data: sortedGenres.map(([,count]) => count),
                backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'bottom',
                    labels: { color: '#cbd5e1', usePointStyle: true }
                }
            }
        }
    });
}

function createStudioChart(animeList) {
    const canvas = document.getElementById('studioChart');
    if (canvas.chart) canvas.chart.destroy();
    
    const studioCounts = {};
    animeList.forEach(anime => {
        anime.studios?.forEach(studio => {
            studioCounts[studio.name] = (studioCounts[studio.name] || 0) + 1;
        });
    });
    
    const sortedStudios = Object.entries(studioCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sortedStudios.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No studio data available</p>';
        return;
    }
    
    canvas.chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sortedStudios.map(([studio]) => studio),
            datasets: [{
                data: sortedStudios.map(([,count]) => count),
                backgroundColor: '#6366f1'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { 
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });
}

function createAuthorChart(mangaList) {
    const canvas = document.getElementById('studioChart');
    if (canvas.chart) canvas.chart.destroy();
    
    const authorCounts = {};
    mangaList.forEach(manga => {
        manga.authors?.forEach(author => {
            authorCounts[author.name] = (authorCounts[author.name] || 0) + 1;
        });
    });
    
    const sortedAuthors = Object.entries(authorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sortedAuthors.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No author data available</p>';
        return;
    }
    
    canvas.chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sortedAuthors.map(([author]) => author),
            datasets: [{
                data: sortedAuthors.map(([,count]) => count),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { 
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });
}

function createTimelineChart(itemList) {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    
    // Use current month for demo data
    const monthCounts = {};
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    monthCounts[currentMonth] = itemList.length;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => monthCounts[month] || 0);
    const color = currentStatsType === 'anime' ? '#6366f1' : '#10b981';
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { 
                    beginAtZero: true,
                    grid: { color: '#334155' }
                },
                x: { 
                    grid: { display: false }
                }
            }
        }
    });
}

function showStatsLoading() {
    document.querySelector('.charts-grid').innerHTML = `
        <div class="loading-spinner" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
            <p style="margin-top: 1rem; color: var(--text-secondary);">Loading your stats...</p>
        </div>
    `;
}

function showEmptyState() {
    const contentType = currentStatsType.charAt(0).toUpperCase() + currentStatsType.slice(1);
    document.querySelector('.charts-grid').innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fas fa-chart-bar" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
            <h2>No ${contentType} Stats Yet</h2>
            <p>Add some ${currentStatsType} to your list to see your stats!</p>
            <a href="search.html" class="back-btn">Start Adding ${contentType}</a>
        </div>
    `;
    
    // Reset overview stats
    document.getElementById('total-anime').textContent = '0';
    document.getElementById('avg-rating').textContent = '0.0';
    document.getElementById('total-episodes').textContent = '0';
}