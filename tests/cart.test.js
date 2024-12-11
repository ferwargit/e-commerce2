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

            // Intentar añadir un noveno producto
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

    describe('Actualización de cantidades', () => {
        it('debe actualizar la cantidad de un producto existente', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const resultadoActualizacion = cartService.updateQuantity(producto.id, 2);
            
            expect(resultadoActualizacion).toBe(true);
            expect(cartService.getCart()[0].quantity).toBe(2);
        });

        it('no debe permitir actualizar cantidad mayor al límite máximo por defecto', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const resultadoActualizacion = cartService.updateQuantity(producto.id, 4);
            
            expect(resultadoActualizacion).toBe(true);
            expect(cartService.getCart()[0].quantity).toBe(3); // Límite máximo
        });

        it('debe permitir actualizar cantidad con opción de desbordamiento', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const resultadoActualizacion = cartService.updateQuantity(producto.id, 5, { allowOverflow: true });
            
            expect(resultadoActualizacion).toBe(true);
            expect(cartService.getCart()[0].quantity).toBe(5);
        });

        it('debe eliminar el producto si la cantidad se actualiza a 0', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const resultadoActualizacion = cartService.updateQuantity(producto.id, 0);
            
            expect(resultadoActualizacion).toBe(true);
            expect(cartService.getCart().length).toBe(0);
        });

        it('debe devolver false al intentar actualizar cantidad de producto inexistente', () => {
            const resultadoActualizacion = cartService.updateQuantity(999, 2);
            
            expect(resultadoActualizacion).toBe(false);
            expect(cartService.getCart().length).toBe(0);
        });

        it('debe actualizar localStorage al modificar cantidad', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const localStorageSetItemSpy = vi.spyOn(localStorage, 'setItem');
            
            cartService.updateQuantity(producto.id, 2);
            
            expect(localStorageSetItemSpy).toHaveBeenCalledTimes(2); // Una por addToCart, otra por updateQuantity
            localStorageSetItemSpy.mockRestore();
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

    describe('Eliminación de productos del carrito', () => {
        it('debe eliminar un producto existente del carrito', () => {
            const producto1 = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            const producto2 = {
                id: 2,
                title: 'Test Product 2',
                price: 10.99,
                quantity: 1
            };
            
            cartService.addToCart(producto1);
            cartService.addToCart(producto2);
            
            const resultadoEliminacion = cartService.removeFromCart(producto1.id);
            
            expect(resultadoEliminacion).toBe(true);
            expect(cartService.getCart().length).toBe(1);
            expect(cartService.getCart()[0].id).toBe(producto2.id);
        });

        it('debe devolver false al intentar eliminar un producto inexistente', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const resultadoEliminacion = cartService.removeFromCart(999); // ID inexistente
            
            expect(resultadoEliminacion).toBe(false);
            expect(cartService.getCart().length).toBe(1);
        });

        it('debe manejar la eliminación cuando el carrito está vacío', () => {
            const resultadoEliminacion = cartService.removeFromCart(1);
            
            expect(resultadoEliminacion).toBe(false);
            expect(cartService.getCart().length).toBe(0);
        });

        it('debe actualizar localStorage al eliminar un producto', () => {
            const producto = {
                id: 1,
                title: 'Test Product',
                price: 10.99,
                quantity: 1
            };
            cartService.addToCart(producto);
            
            const localStorageSetItemSpy = vi.spyOn(localStorage, 'setItem');
            
            cartService.removeFromCart(producto.id);
            
            expect(localStorageSetItemSpy).toHaveBeenCalledTimes(2); // Una por addToCart, otra por removeFromCart
            localStorageSetItemSpy.mockRestore();
        });
    });

    describe('Casos Límite del Carrito', () => {
        describe('Límite de Productos Únicos', () => {
            it('debe impedir agregar más de 8 productos únicos', () => {
                // Crear 8 productos diferentes
                const productos = Array.from({ length: 8 }, (_, i) => ({
                    id: i + 1,
                    title: `Producto ${i + 1}`,
                    price: 10.99 + i
                }));

                // Agregar los 8 primeros productos
                productos.forEach(producto => {
                    const resultado = cartService.addToCart(producto);
                    expect(resultado).toBe(true);
                });

                // Intentar agregar un noveno producto
                const productoExtra = {
                    id: 9,
                    title: 'Producto 9',
                    price: 19.99
                };
                const resultadoExtra = cartService.addToCart(productoExtra);
                
                expect(resultadoExtra).toBe(false);
                expect(cartService.getItemCount()).toBe(8);
            });

            it('debe permitir agregar productos duplicados si no supera el límite', () => {
                const producto = {
                    id: 1,
                    title: 'Producto Duplicado',
                    price: 10.99
                };

                const resultados = [
                    cartService.addToCart(producto),
                    cartService.addToCart(producto, { allowDuplicates: true })
                ];

                expect(resultados[0]).toBe(true);
                expect(resultados[1]).toBe(true);
                expect(cartService.getCart()[0].quantity).toBe(2);
                expect(cartService.getCart().length).toBe(1);
            });
        });

        describe('Límite de Cantidad por Producto', () => {
            it('debe impedir agregar más de 3 unidades del mismo producto', () => {
                const producto = {
                    id: 1,
                    title: 'Producto Límite',
                    price: 10.99
                };

                // Intentar agregar 4 veces el mismo producto
                const resultados = [
                    cartService.addToCart(producto),
                    cartService.addToCart(producto),
                    cartService.addToCart(producto),
                    cartService.addToCart(producto)
                ];

                expect(resultados[0]).toBe(true);
                expect(resultados[1]).toBe(true);
                expect(resultados[2]).toBe(true);
                expect(resultados[3]).toBe(false);

                const cart = cartService.getCart();
                expect(cart[0].quantity).toBe(3);
                expect(cart.length).toBe(1);
            });

            it('debe permitir actualizar cantidad respetando el límite máximo', () => {
                const producto = {
                    id: 1,
                    title: 'Producto Límite',
                    price: 10.99
                };

                cartService.addToCart(producto);
                
                const resultadoActualizacion = cartService.updateQuantity(producto.id, 5);
                
                expect(resultadoActualizacion).toBe(true);
                expect(cartService.getCart()[0].quantity).toBe(3);
            });
        });

        describe('Carrito Vacío', () => {
            it('debe manejar operaciones en carrito vacío', () => {
                // Verificar estado inicial
                expect(cartService.getCart().length).toBe(0);
                expect(cartService.getTotal()).toBe(0);
                expect(cartService.getItemCount()).toBe(0);
                expect(cartService.getTotalProductQuantity()).toBe(0);
            });

            it('debe manejar eliminación en carrito vacío', () => {
                const resultadoEliminacion = cartService.removeFromCart(1);
                expect(resultadoEliminacion).toBe(false);
            });

            it('debe manejar actualización de cantidad en carrito vacío', () => {
                const resultadoActualizacion = cartService.updateQuantity(1, 2);
                expect(resultadoActualizacion).toBe(false);
            });
        });
    });

    // Pruebas de Validación de Precios y Cálculos
    describe('Validación de Precios y Cálculos', () => {
        // Pruebas para getTotal()
        describe('Cálculo de Total', () => {
            it('debe calcular correctamente el total de un carrito con un producto', () => {
                const producto = {
                    id: 1,
                    title: 'Producto Simple',
                    price: 10.00
                };

                cartService.addToCart(producto);
                
                expect(cartService.getTotal()).toBe(10.00);
            });

            it('debe calcular correctamente el total de un carrito con múltiples productos', () => {
                const productos = [
                    { id: 1, title: 'Producto 1', price: 10.00 },
                    { id: 2, title: 'Producto 2', price: 15.50 }
                ];

                productos.forEach(producto => cartService.addToCart(producto));
                
                // Total esperado: 10.00 + 15.50 = 25.50
                expect(cartService.getTotal()).toBe(25.50);
            });

            it('debe manejar correctamente decimales en precios', () => {
                const producto = {
                    id: 1,
                    title: 'Producto con Decimales',
                    price: 10.99
                };

                cartService.addToCart(producto);
                cartService.updateQuantity(producto.id, 3);
                
                // Total esperado: 10.99 * 3 = 32.97
                expect(cartService.getTotal()).toBe(32.97);
            });

            it('debe devolver 0 para un carrito vacío', () => {
                expect(cartService.getTotal()).toBe(0);
            });
        });

        // Pruebas para getItemCount()
        describe('Conteo de Productos Únicos', () => {
            it('debe contar correctamente productos únicos', () => {
                const productos = [
                    { id: 1, title: 'Producto 1', price: 10.00 },
                    { id: 2, title: 'Producto 2', price: 15.50 },
                    { id: 3, title: 'Producto 3', price: 20.00 }
                ];

                productos.forEach(producto => cartService.addToCart(producto));
                
                expect(cartService.getItemCount()).toBe(3);
            });

            it('no debe contar productos duplicados', () => {
                const producto = {
                    id: 1,
                    title: 'Producto Duplicado',
                    price: 10.00
                };

                cartService.addToCart(producto);
                cartService.addToCart(producto);
                
                expect(cartService.getItemCount()).toBe(1);
            });

            it('debe devolver 0 para un carrito vacío', () => {
                expect(cartService.getItemCount()).toBe(0);
            });
        });

        // Pruebas para getTotalProductQuantity()
        describe('Conteo de Cantidad Total de Productos', () => {
            it('debe contar correctamente la cantidad total de productos', () => {
                const productos = [
                    { id: 1, title: 'Producto 1', price: 10.00 },
                    { id: 2, title: 'Producto 2', price: 15.50 }
                ];

                cartService.addToCart(productos[0]);
                cartService.updateQuantity(productos[0].id, 2);
                cartService.addToCart(productos[1]);
                
                expect(cartService.getTotalProductQuantity()).toBe(3);
            });

            it('debe devolver 0 para un carrito vacío', () => {
                expect(cartService.getTotalProductQuantity()).toBe(0);
            });
        });

        // Pruebas de Validación de Precios
        describe('Validación de Precios de Productos', () => {
            it('debe rechazar productos con precio negativo', () => {
                const productoInvalido = {
                    id: 1,
                    title: 'Producto Inválido',
                    price: -10.00
                };

                const resultado = cartService.addToCart(productoInvalido);
                
                expect(resultado).toBe(false);
                expect(cartService.getCart().length).toBe(0);
            });

            it('debe rechazar productos con precio cero', () => {
                const productoInvalido = {
                    id: 1,
                    title: 'Producto Inválido',
                    price: 0
                };

                const resultado = cartService.addToCart(productoInvalido);
                
                expect(resultado).toBe(false);
                expect(cartService.getCart().length).toBe(0);
            });
        });
    });
});
