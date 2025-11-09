// 🎮 Anime Games JavaScript
let quoteGame = {
    score: 0,
    round: 1,
    currentQuote: null,
    totalRounds: 10
};

let memoryGame = {
    cards: [],
    flippedCards: [],
    matches: 0,
    moves: 0,
    isProcessing: false
};

document.addEventListener('DOMContentLoaded', function() {
    setupGameCards();
    setupModals();
});

function setupGameCards() {
    document.getElementById('quote-game').addEventListener('click', () => {
        openQuoteGame();
    });
    
    document.getElementById('memory-game').addEventListener('click', () => {
        openMemoryGame();
    });
}

function setupModals() {
    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.game-modal').classList.remove('active');
        });
    });
    
    // Click outside to close
    document.querySelectorAll('.game-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// 💬 Quote Game Functions
async function openQuoteGame() {
    document.getElementById('quote-modal').classList.add('active');
    resetQuoteGame();
    await loadNextQuote();
}

function resetQuoteGame() {
    quoteGame.score = 0;
    quoteGame.round = 1;
    updateQuoteScore();
}

async function loadNextQuote() {
    try {
        // Using AnimeChan API
        const response = await fetch('https://animechan.vercel.app/api/random');
        const data = await response.json();
        
        quoteGame.currentQuote = data;
        displayQuote(data);
    } catch (error) {
        console.error('Error loading quote:', error);
        // Fallback quotes
        const fallbackQuotes = [
            { quote: "I'm not going there to die. I'm going to find out if I'm really alive.", character: "Spike Spiegel", anime: "Cowboy Bebop" },
            { quote: "The world is not beautiful, therefore it is.", character: "Kino", anime: "Kino's Journey" },
            { quote: "I am the bone of my sword.", character: "Archer", anime: "Fate/stay night" }
        ];
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        quoteGame.currentQuote = randomQuote;
        displayQuote(randomQuote);
    }
}

function displayQuote(quoteData) {
    document.getElementById('quote-text').textContent = `"${quoteData.quote}"`;
    
    // Generate options (correct + 3 random)
    const options = [quoteData.character];
    const randomCharacters = ['Naruto Uzumaki', 'Monkey D. Luffy', 'Edward Elric', 'Ichigo Kurosaki', 'Natsu Dragneel', 'Goku'];
    
    while (options.length < 4) {
        const randomChar = randomCharacters[Math.floor(Math.random() * randomCharacters.length)];
        if (!options.includes(randomChar)) {
            options.push(randomChar);
        }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    const optionsContainer = document.getElementById('quote-options');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'quote-option';
        button.textContent = option;
        button.addEventListener('click', () => selectQuoteOption(option, quoteData.character));
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('next-quote').style.display = 'none';
}

function selectQuoteOption(selected, correct) {
    const options = document.querySelectorAll('.quote-option');
    options.forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.textContent === correct) {
            option.classList.add('correct');
        } else if (option.textContent === selected && selected !== correct) {
            option.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        quoteGame.score += 10;
    }
    
    updateQuoteScore();
    
    if (quoteGame.round < quoteGame.totalRounds) {
        document.getElementById('next-quote').style.display = 'block';
        document.getElementById('next-quote').onclick = () => {
            quoteGame.round++;
            updateQuoteScore();
            loadNextQuote();
        };
    } else {
        // Game finished
        setTimeout(() => {
            alert(`Game Over! Final Score: ${quoteGame.score}/${quoteGame.totalRounds * 10}`);
            document.getElementById('quote-modal').classList.remove('active');
        }, 2000);
    }
}

function updateQuoteScore() {
    document.getElementById('quote-score').textContent = quoteGame.score;
    document.getElementById('quote-round').textContent = quoteGame.round;
}

// 🧠 Memory Game Functions
async function openMemoryGame() {
    document.getElementById('memory-modal').classList.add('active');
    await initMemoryGame();
}

async function initMemoryGame() {
    memoryGame.matches = 0;
    memoryGame.moves = 0;
    memoryGame.flippedCards = [];
    memoryGame.isProcessing = false;
    
    updateMemoryScore();
    
    try {
        // Get random character images from Waifu.pics
        const images = [];
        for (let i = 0; i < 8; i++) {
            const response = await fetch('https://api.waifu.pics/sfw/waifu');
            const data = await response.json();
            images.push(data.url);
        }
        
        // Create pairs for 4x4 grid (16 cards total)
        const cardImages = [...images, ...images];
        cardImages.sort(() => Math.random() - 0.5);
        
        createMemoryCards(cardImages);
    } catch (error) {
        console.error('Error loading images:', error);
        // Fallback with placeholder images
        const placeholderImages = Array(16).fill().map((_, i) => `https://via.placeholder.com/150x150/6366f1/ffffff?text=${Math.floor(i/2)+1}`);
        createMemoryCards(placeholderImages);
    }
}

function createMemoryCards(images) {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    images.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.image = image;
        
        card.innerHTML = `
            <div class="card-front">
                <i class="fas fa-question"></i>
            </div>
            <div class="card-back">
                <img src="${image}" alt="Character" loading="lazy">
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card, index));
        grid.appendChild(card);
    });
}

function flipCard(card, index) {
    if (memoryGame.isProcessing || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    card.classList.add('flipped');
    memoryGame.flippedCards.push({ card, index, image: card.dataset.image });
    
    if (memoryGame.flippedCards.length === 2) {
        memoryGame.moves++;
        updateMemoryScore();
        checkMatch();
    }
}

function checkMatch() {
    memoryGame.isProcessing = true;
    const [card1, card2] = memoryGame.flippedCards;
    
    setTimeout(() => {
        if (card1.image === card2.image) {
            // Match found
            card1.card.classList.add('matched');
            card2.card.classList.add('matched');
            memoryGame.matches++;
            
            if (memoryGame.matches === 8) {
                setTimeout(() => {
                    alert(`Congratulations! You won in ${memoryGame.moves} moves!`);
                }, 500);
            }
        } else {
            // No match
            card1.card.classList.remove('flipped');
            card2.card.classList.remove('flipped');
        }
        
        memoryGame.flippedCards = [];
        memoryGame.isProcessing = false;
        updateMemoryScore();
    }, 1000);
}

function updateMemoryScore() {
    document.getElementById('memory-moves').textContent = memoryGame.moves;
    document.getElementById('memory-matches').textContent = memoryGame.matches;
}

// Restart memory game
document.addEventListener('DOMContentLoaded', function() {
    const restartBtn = document.getElementById('restart-memory');
    if (restartBtn) {
        restartBtn.addEventListener('click', initMemoryGame);
    }
});