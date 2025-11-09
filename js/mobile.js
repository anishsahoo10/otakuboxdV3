// Mobile Enhancements - Fixed
document.addEventListener('DOMContentLoaded', function() {
    setupMobileNavigation();
    setupMobileSearch();
});

function setupMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileToggle || !mobileMenu) return;

    // Ensure clean state
    mobileToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.classList.remove('menu-open');

    mobileToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = mobileToggle.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close menu when clicking on links
    const menuLinks = mobileMenu.querySelectorAll('.nav-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('active') && 
            !mobileToggle.contains(e.target) && 
            !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    function openMobileMenu() {
        mobileToggle.classList.add('active');
        mobileMenu.classList.add('active');
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
}

function setupMobileSearch() {
    if (window.innerWidth <= 768) {
        createMobileSearch();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-search')) {
            createMobileSearch();
        } else if (window.innerWidth > 768) {
            const mobileSearch = document.querySelector('.mobile-search');
            if (mobileSearch) {
                mobileSearch.remove();
            }
        }
    });
}

function createMobileSearch() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent || document.querySelector('.mobile-search')) return;
    
    const mobileSearchHTML = `
        <div class="mobile-search">
            <div class="mobile-content-toggle">
                <button class="mobile-toggle-btn active" data-type="anime">
                    <i class="fas fa-play"></i> Anime
                </button>
                <button class="mobile-toggle-btn" data-type="manga">
                    <i class="fas fa-book"></i> Manga
                </button>
            </div>
            <div class="mobile-search-container">
                <input type="text" class="mobile-search-input" placeholder="Search anime..." id="mobile-search-input">
                <button class="mobile-search-btn" id="mobile-search-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('afterbegin', mobileSearchHTML);
    
    // Setup mobile toggle functionality
    const mobileToggleBtns = document.querySelectorAll('.mobile-toggle-btn');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    
    mobileToggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            mobileToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.dataset.type;
            mobileSearchInput.placeholder = `Search ${type}...`;
            
            if (window.switchContentType) {
                window.switchContentType(type);
            }
        });
    });
    
    function performSearch() {
        const query = mobileSearchInput.value.trim();
        if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }
    
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', performSearch);
    }
    
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}