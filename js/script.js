// Mobile Menu Functionality
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar a');

// Toggle menu
menuIcon.addEventListener('click', () => {
    navbar.classList.toggle('open');
    menuIcon.classList.toggle('bx-x');
    document.body.style.overflow = navbar.classList.contains('open') ? 'hidden' : 'auto';
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navbar.classList.contains('open') && 
        !navbar.contains(e.target) && 
        !menuIcon.contains(e.target)) {
        navbar.classList.remove('open');
        menuIcon.classList.remove('bx-x');
        document.body.style.overflow = 'auto';
    }
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('open');
        menuIcon.classList.remove('bx-x');
        document.body.style.overflow = 'auto';
    });
});

// Header scroll effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 100);
});

// const sr = ScrollReveal({
//   distance: "60px",
//   duration: 2500,
//   delay: 400,
//   reset: true,
// });

// sr.reveal(".home-text", { delay: 200, origin: "top" });
// sr.reveal(".home-img", { delay: 300, origin: "top" });
// sr.reveal(".feature, .product, .cta-content, .contact", {
//   delay: 200,
//   origin: "top",
// });
