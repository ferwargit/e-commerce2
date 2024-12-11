import { describe, it, expect, beforeEach } from 'vitest';
import { CartService } from '../js/services/cart.js';

// Mock de localStorage usando el entorno de JSDOM
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    store: {},
};

Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: (key) => {
            console.log(`localStorage.getItem(${key}):`, localStorageMock.store[key]);
            return localStorageMock.store[key] || null;
        },
        setItem: (key, value) => {
            console.log(`localStorage.setItem(${key}, ${value})`);
            localStorageMock.store[key] = value.toString();
            localStorageMock.setItem(key, value);
        },
        removeItem: (key) => {
            console.log(`localStorage.removeItem(${key})`);
            delete localStorageMock.store[key];
            localStorageMock.removeItem(key);
        },
        clear: () => {
            console.log('localStorage.clear()');
            localStorageMock.store = {};
            localStorageMock.clear();
        }
    },
    configurable: true
});

describe('CartService', () => {
    let cartService;

    beforeEach(() => {
        // Reiniciar el servicio antes de cada prueba
        cartService = new CartService();
        // Limpiar localStorage antes de cada prueba
        localStorage.clear();
    });

    it('should initialize with an empty cart', () => {
        const cart = cartService.getCart();
        expect(cart).toEqual([]);
    });

    it('should be able to add a basic product to the cart', () => {
        const testProduct = {
            id: 1,
            title: 'Test Product',
            price: 10.99,
            quantity: 1
        };

        cartService.addToCart(testProduct);
        const cart = cartService.getCart();

        expect(cart.length).toBe(1);
        expect(cart[0].id).toBe(1);
        expect(cart[0].title).toBe('Test Product');
        expect(cart[0].price).toBe(10.99);
    });

    it('should increment quantity when adding an existing product', () => {
        const testProduct = {
            id: 1,
            title: 'Test Product',
            price: 10.99,
            quantity: 1
        };

        cartService.addToCart(testProduct);
        cartService.addToCart(testProduct);
        cartService.addToCart(testProduct);
        const cart = cartService.getCart();

        expect(cart.length).toBe(1);
        expect(cart[0].quantity).toBe(3);
    });

    it('should not add more than 3 units of the same product', () => {
        const testProduct = {
            id: 1,
            title: 'Test Product',
            price: 10.99,
            quantity: 1
        };

        cartService.addToCart(testProduct);
        cartService.addToCart(testProduct);
        cartService.addToCart(testProduct);
        const result = cartService.addToCart(testProduct);
        const cart = cartService.getCart();

        expect(result).toBe(false);
        expect(cart.length).toBe(1);
        expect(cart[0].quantity).toBe(3);
    });

    it('should remove a product from the cart', () => {
        const testProduct = {
            id: 1,
            title: 'Test Product',
            price: 10.99,
            quantity: 1
        };

        cartService.addToCart(testProduct);
        cartService.removeFromCart(1);
        const cart = cartService.getCart();

        expect(cart.length).toBe(0);
    });
});
