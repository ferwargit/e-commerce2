document.querySelector('.hamburger-menu').addEventListener('click', () => {
    document.querySelector('.mobile-nav').classList.toggle('active');
    document.querySelector('.menu-overlay').classList.toggle('active');
});

document.querySelector('.menu-overlay').addEventListener('click', () => {
    document.querySelector('.mobile-nav').classList.remove('active');
    document.querySelector('.menu-overlay').classList.remove('active');
});