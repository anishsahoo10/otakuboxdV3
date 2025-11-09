// Simplified Mobile Enhancements for OtakuBoxd
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobile);
    } else {
        setTimeout(initMobile, 100);
    }
    
    function initMobile() {
        setupMobileNavigation();
        setupTouchOptimizations();
        setupMobileSearch();
        setupResponsiveImages();
    }
    
    function setupMobileNavigation() {
        try {
            const mobileToggle = document.getElementById('mobile-toggle');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            if (!mobileToggle || !mobileMenu) return;
        
        // Ensure clean state
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Mobile menu toggle
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
        } catch (error) {
            console.error('Mobile navigation setup error:', error);
        }
    }
    
    function setupTouchOptimizations() {
        // Add touch class for CSS targeting
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
        
        // Optimize scrolling for trending containers
        const trendingContainers = document.querySelectorAll('.trending-container');
        trendingContainers.forEach(container => {
            let isScrolling = false;
            let startX = 0;
            let scrollLeft = 0;
            
            container.addEventListener('touchstart', function(e) {
                isScrolling = true;
                startX = e.touches[0].pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            }, { passive: true });
            
            container.addEventListener('touchmove', function(e) {
                if (!isScrolling) return;
                const x = e.touches[0].pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
            }, { passive: true });
            
            container.addEventListener('touchend', function() {
                isScrolling = false;
            }, { passive: true });
        });
        
        // Add haptic feedback for interactive elements
        if (navigator.vibrate) {
            const interactiveElements = document.querySelectorAll(
                '.anime-card, .trending-card, .gallery-card, .btn-primary, .btn-secondary, .nav-btn, .tab-btn'
            );
            
            interactiveElements.forEach(element => {
                element.addEventListener('touchstart', function() {
                    navigator.vibrate(10);
                }, { passive: true });
            });
        }
    }
    
    function setupMobileSearch() {
        // Always check on load and resize
        createMobileSearchIfNeeded();
        
        window.addEventListener('resize', createMobileSearchIfNeeded);
    }
    
    function createMobileSearchIfNeeded() {
        const mainContent = document.querySelector('.main-content');
        const navSearch = document.querySelector('.nav-search');
        const existingMobileSearch = document.querySelector('.mobile-search');
        
        if (window.innerWidth <= 768 && navSearch && mainContent && !existingMobileSearch) {
            createMobileSearchBar();
        } else if (window.innerWidth > 768 && existingMobileSearch) {
            existingMobileSearch.remove();
        }
    }
    
    function createMobileSearchBar() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
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
        setupMobileSearchFunctionality();
    }
    
    function setupMobileSearchFunctionality() {
        
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const mobileSearchBtn = document.getElementById('mobile-search-btn');
        const mobileToggleBtns = document.querySelectorAll('.mobile-toggle-btn');
        
        if (!mobileSearchInput || !mobileSearchBtn || !mobileToggleBtns.length) return;
        
        // Content type toggle
        mobileToggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                mobileToggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const type = btn.dataset.type;
                mobileSearchInput.placeholder = `Search ${type}...`;
                
                // Use existing switchContentType function if available
                if (window.switchContentType) {
                    window.switchContentType(type);
                }
            });
        });
        
        // Search functionality
        function performSearch() {
            const query = mobileSearchInput.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }
        
        mobileSearchBtn.addEventListener('click', performSearch);
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Mobile search functionality is now handled in createMobileSearchIfNeeded
    }
    
    function setupResponsiveImages() {
        // Lazy loading for images
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loading');
                        
                        img.addEventListener('load', function() {
                            img.classList.remove('loading');
                            img.classList.add('loaded');
                        });
                        
                        img.addEventListener('error', function() {
                            img.classList.remove('loading');
                            img.classList.add('error');
                            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTQwQzEwNS41MjMgMTQwIDExMCAxMzUuNTIzIDExMCAxMzBDMTEwIDEyNC40NzcgMTA1LjUyMyAxMjAgMTAwIDEyMEM5NC40NzcgMTIwIDkwIDEyNC40NzcgOTAgMTMwQzkwIDEzNS41MjMgOTQuNDc3IDE0MCAxMDAgMTQwWiIgZmlsbD0iIzY0NzQ4QiIvPgo8L3N2Zz4K';
                        });
                        
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }
    
    // Utility functions
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Add mobile-specific classes
    if (isMobile()) {
        document.body.classList.add('mobile-device');
    }
    
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.classList.add('ios-device');
    }
    
    if (/Android/.test(navigator.userAgent)) {
        document.body.classList.add('android-device');
    }
    
})();

// Add mobile-specific CSS
const mobileCSS = `
.mobile-search {
    display: none;
    position: sticky;
    top: 85px;
    z-index: 999;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .nav-search {
        display: none !important;
    }
    
    .mobile-search {
        display: block !important;
    }
}

.mobile-content-toggle {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.mobile-toggle-btn {
    flex: 1;
    padding: 0.75rem;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.mobile-toggle-btn.active {
    background: var(--primary) !important;
    color: white !important;
    border-color: var(--primary);
    transform: scale(1.05);
}

.mobile-toggle-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.mobile-search-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.mobile-search-input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 2rem;
    color: var(--text-primary);
    font-size: 1rem;
}

.mobile-search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.mobile-search-btn {
    padding: 0.75rem 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mobile-search-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

body.menu-open {
    overflow: hidden;
}

.touch-device .anime-card,
.touch-device .trending-card,
.touch-device .gallery-card {
    transition: transform 0.2s ease;
}

.touch-device .anime-card:active,
.touch-device .trending-card:active,
.touch-device .gallery-card:active {
    transform: scale(0.98);
}

img.loading {
    opacity: 0.5;
}

img.loaded {
    opacity: 1;
    transition: opacity 0.3s ease;
}

img.error {
    opacity: 0.3;
}

@media (max-width: 768px) {
    .mobile-search {
        display: block;
    }
}

@media (min-width: 769px) {
    .mobile-search {
        display: none;
    }
}
`;

// Inject the CSS
if (!document.getElementById('mobile-enhancements-css')) {
    const style = document.createElement('style');
    style.id = 'mobile-enhancements-css';
    style.textContent = mobileCSS;
    document.head.appendChild(style);
}