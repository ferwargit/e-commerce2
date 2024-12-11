// Mobile Menu Functionality
function initMobileMenu() {
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar a');

    if (!menuIcon || !navbar) {
        console.warn('Menu elements not found');
        return { 
            toggleMenu: () => {}, 
            closeMenu: () => {} 
        };
    }

    // Toggle menu
    function toggleMenu() {
        navbar.classList.toggle('open');
        menuIcon.classList.toggle('bx-x');
        document.body.style.overflow = navbar.classList.contains('open') ? 'hidden' : 'auto';
    }

    // Close menu
    function closeMenu() {
        navbar.classList.remove('open');
        menuIcon.classList.remove('bx-x');
        document.body.style.overflow = 'auto';
    }

    menuIcon.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navbar.classList.contains('open') && 
            !navbar.contains(e.target) && 
            !menuIcon.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    return { toggleMenu, closeMenu };
}

// Header scroll effect
function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    if (!header) {
        console.warn('Header element not found');
        return { 
            updateHeaderSticky: () => {},
            addStickyClass: () => {},
            removeStickyClass: () => {}
        };
    }

    function updateHeaderSticky() {
        header.classList.toggle('sticky', window.scrollY > 100);
    }

    function addStickyClass() {
        header.classList.add('sticky');
    }

    function removeStickyClass() {
        header.classList.remove('sticky');
    }

    window.addEventListener('scroll', updateHeaderSticky);

    return { updateHeaderSticky, addStickyClass, removeStickyClass };
}

// Initialize all scripts
function initScripts() {
    const mobileMenu = initMobileMenu();
    const headerScroll = initHeaderScrollEffect();
    return { mobileMenu, headerScroll };
}

// Run initialization when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScripts);
} else {
    initScripts();
}

export { initMobileMenu, initHeaderScrollEffect, initScripts };
