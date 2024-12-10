import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Configurar un DOM virtual
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="cart-icon"></div>
      <div id="cart-modal"></div>
      <div id="cart-items"></div>
    </body>
  </html>
`, {
  url: 'http://localhost',
  runScripts: 'dangerously'
});

global.document = dom.window.document;
global.window = dom.window;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Importar después de configurar el entorno
import { cartService } from '../js/services/cart.js';

describe('CartService', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería inicializarse correctamente', () => {
    expect(cartService).toBeDefined();
    expect(cartService.cart).toEqual([]);
    expect(cartService.observers).toEqual([]);
  });

  it('debería tener métodos básicos definidos', () => {
    expect(typeof cartService.addToCart).toBe('function');
    expect(typeof cartService.removeFromCart).toBe('function');
    expect(typeof cartService.getCart).toBe('function');
    expect(typeof cartService.getTotal).toBe('function');
  });
});
