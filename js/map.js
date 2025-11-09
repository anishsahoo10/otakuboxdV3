// Anime locations data
const animeLocations = [
    {
        name: "Kanda Shrine",
        anime: "Love Live!",
        city: "tokyo",
        description: "Famous shrine featured in Love Live! where the characters often visit.",
        coordinates: "35.7023,139.7676",
        image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300&h=200&fit=crop"
    },
    {
        name: "Shibuya Crossing",
        anime: "Your Name",
        city: "tokyo", 
        description: "Iconic crossing featured in many anime including Your Name.",
        coordinates: "35.6598,139.7006",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop"
    },
    {
        name: "Tokyo Station",
        anime: "5 Centimeters Per Second",
        city: "tokyo",
        description: "Central railway station featured in Makoto Shinkai's films.",
        coordinates: "35.6812,139.7671",
        image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=300&h=200&fit=crop"
    },
    {
        name: "Akihabara Electric Town",
        anime: "Steins;Gate",
        city: "tokyo",
        description: "Electronics district central to Steins;Gate's storyline.",
        coordinates: "35.6762,139.7707",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=300&h=200&fit=crop"
    },
    {
        name: "Fushimi Inari Shrine",
        anime: "Inari Kon Kon",
        city: "kyoto",
        description: "Thousands of torii gates featured in various anime.",
        coordinates: "34.9671,135.7727",
        image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=300&h=200&fit=crop"
    },
    {
        name: "Kiyomizu Temple",
        anime: "K-On!",
        city: "kyoto",
        description: "Historic temple featured in K-On! school trip episodes.",
        coordinates: "34.9949,135.7851",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop"
    },
    {
        name: "Himeji Castle",
        anime: "Castle in the Sky",
        city: "other",
        description: "Inspiration for the castle in Studio Ghibli's Castle in the Sky.",
        coordinates: "34.8394,134.6939",
        image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=200&fit=crop"
    },
    {
        name: "Enoshima Island",
        anime: "Slam Dunk",
        city: "other",
        description: "Coastal area featured in Slam Dunk opening sequence.",
        coordinates: "35.2989,139.4803",
        image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=200&fit=crop"
    }
];

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    setupFilters();
    displayLocations();
});

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.city;
            displayLocations();
        });
    });
}

function displayLocations() {
    const container = document.getElementById('locations-list');
    const filteredLocations = currentFilter === 'all' 
        ? animeLocations 
        : animeLocations.filter(loc => loc.city === currentFilter);
    
    container.innerHTML = '';
    
    filteredLocations.forEach((location, index) => {
        const card = createLocationCard(location, index);
        container.appendChild(card);
    });
}

function createLocationCard(location, index) {
    const card = document.createElement('div');
    card.className = 'location-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="location-image">
            <img src="${location.image}" alt="${location.name}" loading="lazy">
            <div class="anime-badge">${location.anime}</div>
        </div>
        <div class="location-info">
            <h3>${location.name}</h3>
            <p>${location.description}</p>
            <button class="view-map-btn" onclick="showOnMap('${location.coordinates}', '${location.name}')">
                <i class="fas fa-map-marker-alt"></i> View on Map
            </button>
        </div>
    `;
    
    return card;
}

function showOnMap(coordinates, name) {
    const iframe = document.getElementById('google-map');
    const [lat, lng] = coordinates.split(',');
    
    // Update map to show specific location
    iframe.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890`;
    
    // Smooth scroll to map
    document.querySelector('.map-display').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
    
    // Highlight selected location
    document.querySelectorAll('.location-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.location-card').classList.add('selected');
}