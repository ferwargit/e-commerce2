import { describe, it, expect, beforeEach, vi } from 'vitest';
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
        cartService = new CartService({
            mockLocalStorage: true // Forzar inicialización sin localStorage
        });
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

    describe('Product Validation', () => {
        it('should reject invalid products', () => {
            const invalidProducts = [
                { }, // Empty object
                { id: 1 }, // Missing required fields
                { id: 1, title: 'Test', price: -10 }, // Negative price
                { id: 1, title: 'Test', price: 'not a number' }, // Invalid price type
                null,
                undefined
            ];

            invalidProducts.forEach(product => {
                const result = cartService.addToCart(product);
                expect(result).toBe(false);
            });
        });

        it('should accept valid products', () => {
            const validProduct = {
                id: 1,
                title: 'Valid Product',
                price: 10.99,
                quantity: 1
            };

            const result = cartService.addToCart(validProduct);
            expect(result).toBe(true);
            expect(cartService.getCart().length).toBe(1);
        });
    });

    describe('Unique Products Limit', () => {
        it('should limit unique products to 8', () => {
            const createProduct = (id) => ({
                id,
                title: `Product ${id}`,
                price: 10.99,
                quantity: 1
            });

            // Añadir 8 productos diferentes
            for (let i = 1; i <= 8; i++) {
                const result = cartService.addToCart(createProduct(i));
                expect(result).toBe(true);
            }

            // Intentar añadir un noveno producto único
            const result = cartService.addToCart(createProduct(9));
            expect(result).toBe(false);
            expect(cartService.getCart().length).toBe(8);
        });
    });

    describe('Quantity Update', () => {
        it('should update quantity correctly', () => {
            const product = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };

            cartService.addToCart(product);
            const updateResult = cartService.updateQuantity(1, 2);
            
            expect(updateResult).toBe(true);
            const cart = cartService.getCart();
            expect(cart[0].quantity).toBe(2);
        });

        it('should remove product when quantity is set to 0', () => {
            const product = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };

            cartService.addToCart(product);
            const updateResult = cartService.updateQuantity(1, 0);
            
            expect(updateResult).toBe(true);
            const cart = cartService.getCart();
            expect(cart.length).toBe(0);
        });

        it('should not update quantity for non-existent product', () => {
            const updateResult = cartService.updateQuantity(999, 2);
            expect(updateResult).toBe(false);
        });

        it('should not exceed maximum product quantity', () => {
            const product = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };

            cartService.addToCart(product);
            const updateResult = cartService.updateQuantity(1, 5);
            
            expect(updateResult).toBe(true);
            const cart = cartService.getCart();
            expect(cart[0].quantity).toBe(3); // Máximo 3 unidades
        });
    });

    describe('Observers', () => {
        it('should notify observers when cart changes', () => {
            const observer = vi.fn();
            cartService.registerObserver(observer);

            const product = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };

            cartService.addToCart(product);
            expect(observer).toHaveBeenCalledTimes(1);
            expect(observer).toHaveBeenCalledWith(cartService.getCart());

            cartService.removeFromCart(1);
            expect(observer).toHaveBeenCalledTimes(2);
        });

        it('should handle multiple observers', () => {
            const observer1 = vi.fn();
            const observer2 = vi.fn();

            cartService.registerObserver(observer1);
            cartService.registerObserver(observer2);

            const product = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };

            cartService.addToCart(product);
            expect(observer1).toHaveBeenCalledTimes(1);
            expect(observer2).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle localStorage unavailability gracefully', () => {
            // Simular localStorage no disponible
            const originalLocalStorage = window.localStorage;
            Object.defineProperty(window, 'localStorage', { 
                value: null, 
                writable: true 
            });

            const product = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };

            const addResult = cartService.addToCart(product);
            const saveResult = cartService.saveCart();

            expect(addResult).toBe(true);
            expect(saveResult).toBe(false);

            // Restaurar localStorage
            Object.defineProperty(window, 'localStorage', { 
                value: originalLocalStorage, 
                writable: true 
            });
        });
    });
});
