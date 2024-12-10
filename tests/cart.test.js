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

describe('Observers de CartService', () => {
  let cartService;

  beforeEach(() => {
    cartService = new CartService();
    // Limpiar el carrito antes de cada test
    cartService.emptyCart();
  });

  it('debería registrar un observer correctamente', () => {
    const mockObserver = vi.fn();
    
    cartService.addObserver(mockObserver);
    
    // Verificar que el observer se ha añadido
    expect(cartService.observers).toContain(mockObserver);
  });

  it('debería notificar a los observers después de añadir un producto', () => {
    const mockObserver1 = vi.fn();
    const mockObserver2 = vi.fn();
    
    cartService.addObserver(mockObserver1);
    cartService.addObserver(mockObserver2);
    
    const testProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };
    
    cartService.addToCart(testProduct);
    
    // Verificar que ambos observers fueron llamados
    expect(mockObserver1).toHaveBeenCalledTimes(1);
    expect(mockObserver2).toHaveBeenCalledTimes(1);
    
    // Verificar que los observers reciben el estado correcto del carrito
    expect(mockObserver1).toHaveBeenCalledWith([testProduct]);
    expect(mockObserver2).toHaveBeenCalledWith([testProduct]);
  });

  it('debería notificar a los observers después de eliminar un producto', () => {
    const mockObserver = vi.fn();
    
    cartService.addObserver(mockObserver);
    
    const testProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };
    
    cartService.addToCart(testProduct);
    cartService.removeFromCart(1);
    
    // Verificar que el observer fue llamado dos veces (añadir y eliminar)
    expect(mockObserver).toHaveBeenCalledTimes(2);
    
    // Verificar que el último estado es un carrito vacío
    expect(mockObserver).toHaveBeenLastCalledWith([]);
  });

  it('debería notificar a los observers después de actualizar la cantidad', () => {
    const mockObserver = vi.fn();
    
    cartService.addObserver(mockObserver);
    
    const testProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };
    
    cartService.addToCart(testProduct);
    cartService.updateQuantity(1, 2);
    
    // Verificar que el observer fue llamado dos veces
    expect(mockObserver).toHaveBeenCalledTimes(2);
    
    // Verificar el estado del último llamado
    const expectedFinalState = [{ ...testProduct, quantity: 2 }];
    expect(mockObserver).toHaveBeenLastCalledWith(expectedFinalState);
  });

  it('debería notificar a los observers al vaciar el carrito', () => {
    const mockObserver = vi.fn();
    
    cartService.addObserver(mockObserver);
    
    const testProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };
    
    cartService.addToCart(testProduct);
    cartService.emptyCart();
    
    // Verificar que el observer fue llamado dos veces
    expect(mockObserver).toHaveBeenCalledTimes(2);
    
    // Verificar que el último estado es un carrito vacío
    expect(mockObserver).toHaveBeenLastCalledWith([]);
  });

  it('debería manejar múltiples observers correctamente', () => {
    const mockObserver1 = vi.fn();
    const mockObserver2 = vi.fn();
    const mockObserver3 = vi.fn();
    
    cartService.addObserver(mockObserver1);
    cartService.addObserver(mockObserver2);
    cartService.addObserver(mockObserver3);
    
    const testProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };
    
    cartService.addToCart(testProduct);
    
    // Verificar que todos los observers fueron llamados
    expect(mockObserver1).toHaveBeenCalledTimes(1);
    expect(mockObserver2).toHaveBeenCalledTimes(1);
    expect(mockObserver3).toHaveBeenCalledTimes(1);
    
    // Verificar que todos recibieron el mismo estado
    expect(mockObserver1).toHaveBeenCalledWith([testProduct]);
    expect(mockObserver2).toHaveBeenCalledWith([testProduct]);
    expect(mockObserver3).toHaveBeenCalledWith([testProduct]);
  });
});

describe('Límites Avanzados de updateQuantity()', () => {
  let cartService;
  let testProduct;

  beforeEach(() => {
    // Configurar un mock de localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;

    cartService = new CartService();
    cartService.emptyCart();

    testProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      quantity: 1
    };

    // Añadir un producto al carrito antes de cada test
    cartService.addToCart(testProduct);
  });

  afterEach(() => {
    // Limpiar el mock de localStorage
    delete global.localStorage;
  });

  it('debería manejar actualización a cantidad 0 (eliminar producto)', () => {
    cartService.updateQuantity(1, 0);
    
    expect(cartService.getCart().length).toBe(0);
    expect(cartService.getCart()).toEqual([]);
  });

  it('debería limitar la cantidad máxima a 3', () => {
    cartService.updateQuantity(1, 5);
    
    const updatedProduct = cartService.getCart()[0];
    expect(updatedProduct.quantity).toBe(3);
  });

  it('debería limitar la cantidad mínima a 0', () => {
    cartService.updateQuantity(1, -3);
    
    expect(cartService.getCart().length).toBe(0);
  });

  it('no debería hacer nada al intentar actualizar un producto no existente', () => {
    const initialCart = [...cartService.getCart()];
    
    cartService.updateQuantity(999, 2);
    
    expect(cartService.getCart()).toEqual(initialCart);
  });

  it('debería notificar a los observers al actualizar cantidad', () => {
    const mockObserver = vi.fn();
    cartService.addObserver(mockObserver);
    
    cartService.updateQuantity(1, 2);
    
    expect(mockObserver).toHaveBeenCalledTimes(1);
    expect(mockObserver.mock.calls[0][0][0].quantity).toBe(2);
  });

  it('debería guardar en localStorage después de actualizar cantidad', () => {
    const localStorageSetItemSpy = vi.spyOn(global.localStorage, 'setItem');
    
    cartService.updateQuantity(1, 2);
    
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('cart', expect.any(String));
    localStorageSetItemSpy.mockRestore();
  });

  it('debería manejar múltiples actualizaciones de cantidad', () => {
    // Incrementar a 2
    cartService.updateQuantity(1, 2);
    expect(cartService.getCart()[0].quantity).toBe(2);
    
    // Incrementar a 3
    cartService.updateQuantity(1, 3);
    expect(cartService.getCart()[0].quantity).toBe(3);
    
    // Intentar incrementar más allá de 3
    cartService.updateQuantity(1, 5);
    expect(cartService.getCart()[0].quantity).toBe(3);
  });

  it('debería mantener el precio original al actualizar cantidad', () => {
    const originalPrice = testProduct.price;
    
    cartService.updateQuantity(1, 3);
    
    const updatedProduct = cartService.getCart()[0];
    expect(updatedProduct.price).toBe(originalPrice);
  });
});
