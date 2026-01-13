// ==================== NAVIGATION UTILITIES ====================

/**
 * Initialize navigation menu
 */
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleNavMenu);
    }
    
    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeNavMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.hamburger')) {
            closeNavMenu();
        }
    });
}

/**
 * Toggle navigation menu visibility
 */
function toggleNavMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

/**
 * Close navigation menu
 */
function closeNavMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}

/**
 * Set active navigation item based on current page
 */
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Navigate to a specific page
 * @param {string} page - Page name or URL
 */
function navigateTo(page) {
    if (page && typeof page === 'string') {
        window.location.href = page;
    }
}

/**
 * Check if navigation element exists and is ready
 * @returns {boolean}
 */
function isNavigationReady() {
    return document.querySelector('.nav-menu') !== null;
}

/**
 * Update breadcrumb navigation
 * @param {Array} breadcrumbs - Array of breadcrumb objects {label, url}
 */
function updateBreadcrumbs(breadcrumbs) {
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    if (!breadcrumbContainer) return;
    
    breadcrumbContainer.innerHTML = '';
    
    breadcrumbs.forEach((crumb, index) => {
        const item = document.createElement('li');
        
        if (index === breadcrumbs.length - 1) {
            item.className = 'breadcrumb-item active';
            item.textContent = crumb.label;
        } else {
            item.className = 'breadcrumb-item';
            const link = document.createElement('a');
            link.href = crumb.url;
            link.textContent = crumb.label;
            item.appendChild(link);
        }
        
        breadcrumbContainer.appendChild(item);
    });
}

/**
 * Initialize profile dropdown menu
 */
function initializeProfileDropdown() {
    const profileBtn = document.querySelector('.header-profile');
    const dropdown = document.querySelector('.header-profile-dropdown');
    
    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-profile')) {
                dropdown.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking on items
        const dropdownItems = dropdown.querySelectorAll('a, button');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        });
    }
}

/**
 * Initialize mobile menu toggle
 */
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (hamburger) {
        hamburger.addEventListener('click', toggleNavMenu);
    }
    
    if (navToggle) {
        navToggle.addEventListener('click', toggleNavMenu);
    }
}

/**
 * Update active sidebar menu item
 * @param {string} menuItemId - ID of the menu item to activate
 */
function setActiveSidebarItem(menuItemId) {
    const sidebarItems = document.querySelectorAll('.sidebar-menu a');
    
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.getElementById(menuItemId);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

/**
 * Handle back button navigation
 */
function goBack() {
    window.history.back();
}

/**
 * Initialize all navigation components
 */
function initializeAllNavigation() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeNavigation();
            initializeProfileDropdown();
            initializeMobileMenu();
            setActiveNavItem();
        });
    } else {
        initializeNavigation();
        initializeProfileDropdown();
        initializeMobileMenu();
        setActiveNavItem();
    }
}

// Auto-initialize when script loads
initializeAllNavigation();
