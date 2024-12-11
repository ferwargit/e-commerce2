import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import '@testing-library/jest-dom';

describe('Mobile Menu Functionality', () => {
  let dom;
  let window;
  let document;
  let menuIcon;
  let navbar;
  let mobileMenu;
  let header;

  beforeEach(async () => {
    // Create a fresh JSDOM instance for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="menu-icon" class="bx bx-menu"></div>
          <nav class="navbar">
            <a href="#home">Home</a>
            <a href="#products">Products</a>
          </nav>
          <header id="main-header"></header>
        </body>
      </html>
    `, { 
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    // Explicitly set global window and document
    global.window = dom.window;
    global.document = dom.window.document;

    // Reset mocks before each test
    vi.resetAllMocks();

    // Capture DOM elements using global document
    menuIcon = global.document.querySelector('#menu-icon');
    navbar = global.document.querySelector('.navbar');
    header = global.document.querySelector('header');

    // Import script dynamically
    const scriptModule = await import('../js/script.js');
    
    // Destructure and initialize mobile menu functions
    const { initMobileMenu } = scriptModule;
    const mobileMenuResult = initMobileMenu();

    // Assign menu functions
    mobileMenu = {
      toggle: mobileMenuResult.toggleMenu,
      close: mobileMenuResult.closeMenu
    };
  });

  afterEach(() => {
    // Clean up JSDOM
    dom.window.close();
    vi.restoreAllMocks();
  });

  it('should toggle menu open state', () => {
    // Trigger menu toggle
    mobileMenu.toggle();

    // Assertions
    expect(navbar.classList.contains('open')).toBe(true);
    expect(menuIcon.classList.contains('bx-x')).toBe(true);
    expect(global.document.body.style.overflow).toBe('hidden');
  });

  it('should close menu when clicking outside', () => {
    // Open menu first
    mobileMenu.toggle();

    // Simulate click outside
    const outsideEvent = new global.window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: global.window
    });
    global.document.body.dispatchEvent(outsideEvent);

    // Assertions
    expect(navbar.classList.contains('open')).toBe(false);
    expect(menuIcon.classList.contains('bx-x')).toBe(false);
    expect(global.document.body.style.overflow).toBe('auto');
  });

  it('should close menu when clicking nav link', () => {
    // Open menu first
    mobileMenu.toggle();

    // Find and click a nav link
    const homeLink = global.document.querySelector('.navbar a[href="#home"]');
    const linkEvent = new global.window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: global.window
    });
    homeLink.dispatchEvent(linkEvent);

    // Assertions
    expect(navbar.classList.contains('open')).toBe(false);
    expect(menuIcon.classList.contains('bx-x')).toBe(false);
    expect(global.document.body.style.overflow).toBe('auto');
  });
});

describe('Header Scroll Effect', () => {
  let dom;
  let window;
  let document;
  let header;
  let headerScroll;

  beforeEach(async () => {
    // Create a fresh JSDOM instance for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <header id="main-header"></header>
        </body>
      </html>
    `, { 
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    // Explicitly set global window and document
    global.window = dom.window;
    global.document = dom.window.document;

    // Reset mocks before each test
    vi.resetAllMocks();

    // Capture header element using global document
    header = global.document.querySelector('header');

    // Import script dynamically
    const scriptModule = await import('../js/script.js');
    
    // Destructure and initialize header scroll functions
    const { initHeaderScrollEffect } = scriptModule;
    const headerScrollResult = initHeaderScrollEffect();

    // Assign header scroll functions
    headerScroll = {
      update: headerScrollResult.updateHeaderSticky,
      add: headerScrollResult.addStickyClass,
      remove: headerScrollResult.removeStickyClass
    };

    // Mock scrollY to simulate scrolling
    Object.defineProperty(global.window, 'scrollY', { 
      writable: true, 
      value: 0 
    });
  });

  afterEach(() => {
    // Clean up JSDOM
    dom.window.close();
    vi.restoreAllMocks();
  });

  it('should add sticky class when scrolled more than 100px', () => {
    // Simulate scroll beyond 100px
    global.window.scrollY = 150;
    headerScroll.update();

    // Assertions
    expect(header.classList.contains('sticky')).toBe(true);
  });

  it('should remove sticky class when scrolled less than 100px', () => {
    // First add sticky class
    headerScroll.add();

    // Simulate scroll less than 100px
    global.window.scrollY = 50;
    headerScroll.update();

    // Assertions
    expect(header.classList.contains('sticky')).toBe(false);
  });
});
