import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { CartService } from '../js/services/cart.js';

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

// Mock de localStorage
const localStorageMock = {
  store: {},
  clear() {
    this.store = {};
    console.log('Mock clear called');
  },
  getItem(key) {
    console.log(`Mock getItem called with key: ${key}`);
    return this.store[key] || null;
  },
  setItem(key, value) {
    console.log(`Mock setItem called with key: ${key} value: ${value}`);
    this.store[key] = value.toString();
  },
  removeItem(key) {
    console.log(`Mock removeItem called with key: ${key}`);
    delete this.store[key];
  }
};

// Configurar el mock global de localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

describe('CartService', () => {
  let cartService;

  beforeEach(() => {
    // Limpiar localStorage
    localStorageMock.clear();
    
    // Crear una nueva instancia de CartService
    cartService = new CartService();
    
    // Forzar reinicialización del carrito
    cartService.cart = [];
    cartService.emptyCart();
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

  it('debería añadir un producto al carrito correctamente', () => {
    const producto = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };

    // Espiar los métodos saveCart y notifyObservers
    const saveCartSpy = vi.spyOn(cartService, 'saveCart');
    const notifyObserversSpy = vi.spyOn(cartService, 'notifyObservers');

    // Añadir producto
    cartService.addToCart(producto);

    // Verificaciones
    expect(cartService.cart.length).toBe(1);
    expect(cartService.cart[0]).toEqual({ ...producto, quantity: 1 });
    expect(saveCartSpy).toHaveBeenCalledOnce();
    expect(notifyObserversSpy).toHaveBeenCalledOnce();
  });

  it('debería incrementar la cantidad si se añade un producto existente', () => {
    const producto = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };

    // Añadir producto dos veces
    cartService.addToCart(producto);
    cartService.addToCart(producto);

    // Verificaciones
    expect(cartService.cart.length).toBe(1);
    expect(cartService.cart[0].quantity).toBe(2);
  });

  it('debería respetar el límite máximo de cantidad por producto', () => {
    const producto = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };

    // Añadir producto múltiples veces para superar el límite
    for (let i = 0; i < 10; i++) {
      cartService.addToCart(producto);
    }

    // Verificaciones
    expect(cartService.cart.length).toBe(1);
    expect(cartService.cart[0].quantity).toBe(3);
  });

  it('debería mostrar una advertencia al intentar añadir más de 8 productos únicos', () => {
    const cartService = new CartService();
    
    // Añadir 8 productos diferentes
    for (let i = 1; i <= 8; i++) {
        cartService.addToCart({
            id: i,
            title: `Producto ${i}`,
            price: 10.99,
            quantity: 1
        });
    }

    // Intentar añadir un noveno producto
    const newProduct = {
        id: 9,
        title: 'Producto 9',
        price: 15.99,
        quantity: 1
    };

    const result = cartService.addToCart(newProduct);

    // Verificar que no se añadió el producto
    expect(result).toBe(false);
    
    // Verificar que el carrito sigue teniendo 8 productos únicos
    expect(cartService.getCart().length).toBe(8);
  });
});
