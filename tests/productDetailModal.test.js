import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProductDetailModal from '../js/ui/ProductDetailModal.js';

// Mock del servicio de carrito
class MockCartService {
    addToCart() {}
}

describe('ProductDetailModal', () => {
    let productDetailModal;
    let mockCartService;

    beforeEach(() => {
        // Crear un servicio de carrito mock antes de cada prueba
        mockCartService = new MockCartService();
        
        // Crear una instancia de ProductDetailModal
        productDetailModal = new ProductDetailModal(mockCartService);
    });

    afterEach(() => {
        // Limpiar el DOM después de cada prueba
        document.body.innerHTML = '';
    });

    it('debe inicializar correctamente con un servicio de carrito', () => {
        // Verificar que se ha creado la instancia
        expect(productDetailModal).toBeTruthy();
        
        // Verificar que el servicio de carrito se ha asignado correctamente
        expect(productDetailModal.cartService).toBe(mockCartService);
        
        // Verificar que se han inicializado las propiedades básicas
        expect(productDetailModal.modalContainer).toBeTruthy();
        expect(productDetailModal.currentProduct).toBeNull();
    });

    it('debe crear un contenedor de modal con la estructura correcta', () => {
        // Verificar que el contenedor de modal se ha añadido al body
        const modalContainer = document.body.querySelector('.product-detail-modal');
        expect(modalContainer).toBeTruthy();

        // Verificar elementos clave dentro del modal
        const modalContent = modalContainer.querySelector('.product-detail-content');
        expect(modalContent).toBeTruthy();

        // Verificar botón de cierre
        const closeButton = modalContainer.querySelector('.close-detail-modal');
        expect(closeButton).toBeTruthy();

        // Verificar secciones principales del modal
        const modalGrid = modalContainer.querySelector('.product-modal-grid');
        expect(modalGrid).toBeTruthy();

        // Verificar elementos específicos de información del producto
        const modalImage = modalContainer.querySelector('.product-modal-image img');
        const modalTitle = modalContainer.querySelector('.product-modal-title');
        const modalPrice = modalContainer.querySelector('.product-modal-price');
        const modalDescription = modalContainer.querySelector('.product-modal-description');
        const addToCartButton = modalContainer.querySelector('.btn-add-to-cart');

        expect(modalImage).toBeTruthy();
        expect(modalTitle).toBeTruthy();
        expect(modalPrice).toBeTruthy();
        expect(modalDescription).toBeTruthy();
        expect(addToCartButton).toBeTruthy();
    });

    it('debe crear elementos del DOM con los atributos y clases correctos', () => {
        const modalContainer = document.body.querySelector('.product-detail-modal');
        
        // Verificar clases de elementos clave
        expect(modalContainer.classList.contains('product-detail-modal')).toBe(true);
        
        const modalContent = modalContainer.querySelector('.product-detail-content');
        expect(modalContent.classList.contains('box')).toBe(true);
        
        // Verificar botón de cierre
        const closeButton = modalContainer.querySelector('.close-detail-modal');
        expect(closeButton).toBeTruthy();
        expect(closeButton.querySelector('.ri-close-line')).toBeTruthy();
        
        // Verificar contenedor de imagen
        const imageContainer = modalContainer.querySelector('.box-img.product-modal-image');
        expect(imageContainer).toBeTruthy();
        
        const imageElement = imageContainer.querySelector('img');
        expect(imageElement.getAttribute('src')).toBe('');
        expect(imageElement.getAttribute('alt')).toBe('Product Image');
        
        // Verificar contenedores de información
        const modalInfo = modalContainer.querySelector('.product-modal-info');
        expect(modalInfo).toBeTruthy();
        
        // Verificar elementos de título y precio
        const titleElement = modalContainer.querySelector('.product-modal-title');
        expect(titleElement).toBeTruthy();
        
        const priceElement = modalContainer.querySelector('.product-modal-price.price');
        expect(priceElement).toBeTruthy();
        
        // Verificar secciones de descripción y categoría
        const descriptionContainer = modalContainer.querySelector('.product-modal-description-container');
        expect(descriptionContainer).toBeTruthy();
        expect(descriptionContainer.querySelector('h4').textContent).toBe('Descripción');
        
        const categoryContainer = modalContainer.querySelector('.product-modal-category');
        expect(categoryContainer).toBeTruthy();
        expect(categoryContainer.querySelector('h4').textContent).toBe('Categoría');
        
        // Verificar botón de añadir al carrito
        const addToCartButton = modalContainer.querySelector('.btn-add-to-cart');
        expect(addToCartButton).toBeTruthy();
        expect(addToCartButton.textContent).toBe('Añadir al Carrito');
    });

    describe('Eventos de Modal', () => {
        it('debe cerrar el modal al hacer clic en el botón de cierre', () => {
            const closeButton = document.querySelector('.close-detail-modal');
            
            // Simular que el modal está abierto
            productDetailModal.modalContainer.classList.add('show');
            
            // Disparar evento de clic en el botón de cierre
            closeButton.click();
            
            // Verificar que el modal se ha cerrado
            expect(productDetailModal.modalContainer.classList.contains('show')).toBe(false);
        });

        it('debe cerrar el modal al hacer clic fuera del contenido', () => {
            // Simular que el modal está abierto
            productDetailModal.modalContainer.classList.add('show');
            
            // Disparar evento de clic en el contenedor del modal (fuera del contenido)
            productDetailModal.modalContainer.dispatchEvent(
                new MouseEvent('click', { 
                    bubbles: true, 
                    target: productDetailModal.modalContainer 
                })
            );
            
            // Verificar que el modal se ha cerrado
            expect(productDetailModal.modalContainer.classList.contains('show')).toBe(false);
        });

        it('debe cerrar el modal al presionar la tecla Escape', () => {
            // Simular que el modal está abierto
            productDetailModal.modalContainer.classList.add('show');
            
            // Disparar evento de tecla Escape
            const escapeEvent = new KeyboardEvent('keydown', { 
                key: 'Escape', 
                bubbles: true 
            });
            document.dispatchEvent(escapeEvent);
            
            // Verificar que el modal se ha cerrado
            expect(productDetailModal.modalContainer.classList.contains('show')).toBe(false);
        });
    });

    describe('Método openModal', () => {
        const mockProduct = {
            id: 1,
            title: 'Producto de Prueba',
            price: 29.99,
            description: 'Descripción detallada del producto',
            category: 'Electrónica',
            image: 'https://example.com/imagen.jpg',
            rating: {
                rate: 4.5,
                count: 123
            }
        };

        beforeEach(() => {
            // Asegurarse de que el modal no esté visible antes de cada prueba
            productDetailModal.modalContainer.classList.remove('show');
        });

        it('debe abrir el modal y mostrar correctamente los datos del producto', () => {
            // Abrir el modal con el producto de prueba
            productDetailModal.openModal(mockProduct);

            // Verificar que el modal está visible
            expect(productDetailModal.modalContainer.classList.contains('show')).toBe(true);

            // Verificar datos del producto
            const modalImage = productDetailModal.modalContainer.querySelector('.product-modal-image img');
            const modalTitle = productDetailModal.modalContainer.querySelector('.product-modal-title');
            const modalPrice = productDetailModal.modalContainer.querySelector('.product-modal-price');
            const modalDescription = productDetailModal.modalContainer.querySelector('.product-modal-description');
            const modalCategory = productDetailModal.modalContainer.querySelector('.category-text');

            expect(modalImage.src).toBe(mockProduct.image);
            expect(modalTitle.textContent).toBe(mockProduct.title);
            expect(modalPrice.textContent).toBe(`$${mockProduct.price.toFixed(2)}`);
            expect(modalDescription.textContent).toBe(mockProduct.description);
            expect(modalCategory.textContent).toBe(mockProduct.category);
        });

        it('debe generar correctamente la calificación de estrellas', () => {
            // Abrir el modal con el producto de prueba
            productDetailModal.openModal(mockProduct);

            // Verificar estrellas
            const starsContainer = productDetailModal.modalContainer.querySelector('.stars');
            const starIcons = starsContainer.querySelectorAll('i');
            
            // Verificar número total de estrellas
            expect(starIcons.length).toBe(5);

            // Verificar distribución de estrellas
            const fullStars = starsContainer.querySelectorAll('.ri-star-fill');
            const halfStar = starsContainer.querySelector('.ri-star-half-line');
            const emptyStars = starsContainer.querySelectorAll('.ri-star-line');

            expect(fullStars.length).toBe(4);
            expect(halfStar).toBeTruthy();
            expect(emptyStars.length).toBe(0);

            // Verificar conteo de reseñas
            const reviewCount = productDetailModal.modalContainer.querySelector('.review-count');
            expect(reviewCount.textContent).toBe(`(${mockProduct.rating.count} reseñas)`);
        });

        it('debe almacenar el producto actual para usar en addToCart', () => {
            // Abrir el modal con el producto de prueba
            productDetailModal.openModal(mockProduct);

            // Verificar que el producto actual se ha almacenado
            expect(productDetailModal.currentProduct).toEqual(mockProduct);
        });
    });

    describe('Método generateStarRating', () => {
        // Casos de prueba para diferentes ratings
        const testCases = [
            { rating: 0, expectedFullStars: 0, expectedHalfStars: 0, expectedEmptyStars: 5 },
            { rating: 1, expectedFullStars: 1, expectedHalfStars: 0, expectedEmptyStars: 4 },
            { rating: 2.5, expectedFullStars: 2, expectedHalfStars: 1, expectedEmptyStars: 2 },
            { rating: 4.7, expectedFullStars: 4, expectedHalfStars: 1, expectedEmptyStars: 0 },
            { rating: 5, expectedFullStars: 5, expectedHalfStars: 0, expectedEmptyStars: 0 }
        ];

        testCases.forEach(({ rating, expectedFullStars, expectedHalfStars, expectedEmptyStars }) => {
            it(`debe generar estrellas correctamente para rating ${rating}`, () => {
                // Generar HTML de estrellas
                const starsHTML = productDetailModal.generateStarRating(rating);

                // Crear un elemento temporal para parsear el HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = starsHTML;

                // Contar tipos de estrellas
                const fullStars = tempDiv.querySelectorAll('.ri-star-fill');
                const halfStars = tempDiv.querySelectorAll('.ri-star-half-line');
                const emptyStars = tempDiv.querySelectorAll('.ri-star-line');

                // Verificar número de estrellas
                expect(fullStars.length).toBe(expectedFullStars);
                expect(halfStars.length).toBe(expectedHalfStars);
                expect(emptyStars.length).toBe(expectedEmptyStars);

                // Verificar que el número total de estrellas sea siempre 5
                const totalStars = tempDiv.querySelectorAll('i');
                expect(totalStars.length).toBe(5);
            });
        });

        it('debe manejar ratings fuera de rango', () => {
            // Caso de rating menor que 0
            const negativeRating = productDetailModal.generateStarRating(-1);
            const negativeDiv = document.createElement('div');
            negativeDiv.innerHTML = negativeRating;
            
            // Verificar que todos son estrellas vacías
            const negativeStars = negativeDiv.querySelectorAll('i');
            expect(negativeStars.length).toBe(5);
            negativeStars.forEach(star => {
                expect(star.classList.contains('ri-star-line')).toBe(true);
            });

            // Caso de rating mayor que 5
            const largeRating = productDetailModal.generateStarRating(6);
            const largeDiv = document.createElement('div');
            largeDiv.innerHTML = largeRating;
            
            // Verificar que todos son estrellas llenas
            const largeStars = largeDiv.querySelectorAll('i');
            expect(largeStars.length).toBe(5);
            largeStars.forEach(star => {
                expect(star.classList.contains('ri-star-fill')).toBe(true);
            });
        });

        it('debe generar HTML válido', () => {
            const rating = 3.5;
            const starsHTML = productDetailModal.generateStarRating(rating);

            // Verificar que es un string no vacío
            expect(starsHTML).toBeTruthy();
            expect(typeof starsHTML).toBe('string');

            // Verificar que contiene las clases de iconos correctas
            expect(starsHTML).toContain('ri-star-fill');
            expect(starsHTML).toContain('ri-star-half-line');
            expect(starsHTML).toContain('ri-star-line');
        });
    });

    describe('Método addToCart', () => {
        const mockProduct = {
            id: 1,
            title: 'Producto de Prueba',
            price: 29.99,
            rating: { rate: 4.5, count: 100 },
            description: 'Descripción de prueba',
            category: 'Prueba',
            image: 'https://ejemplo.com/imagen.jpg'
        };

        // Mocks para simular dependencias
        class MockCartService {
            constructor() {
                this.addToCartCalled = false;
                this.addedProduct = null;
            }

            addToCart(product, options) {
                this.addToCartCalled = true;
                this.addedProduct = product;
                
                // Simular una adición exitosa
                if (options && options.notificationCallback) {
                    options.notificationCallback(`${product.title} añadido al carrito`, 'success');
                }
                
                return true;
            }
        }

        class MockCartUI {
            constructor() {
                this.notificationShown = false;
                this.notificationMessage = '';
                this.notificationType = '';
            }

            showCartNotification(message, type) {
                this.notificationShown = true;
                this.notificationMessage = message;
                this.notificationType = type;
            }
        }

        beforeEach(() => {
            // Configurar mocks globales
            const mockCartService = new MockCartService();
            const mockCartUI = new MockCartUI();

            // Reemplazar dependencias
            productDetailModal.cartService = mockCartService;
            window.cartUI = mockCartUI;

            // Abrir modal con producto
            productDetailModal.openModal(mockProduct);
        });

        it('debe llamar a cartService.addToCart con el producto correcto', () => {
            // Simular clic en botón de añadir al carrito
            const addToCartButton = productDetailModal.modalContainer.querySelector('.btn-add-to-cart');
            addToCartButton.click();

            // Verificar llamada a addToCart
            const cartService = productDetailModal.cartService;
            expect(cartService.addToCartCalled).toBe(true);
            
            // Verificar producto añadido
            expect(cartService.addedProduct).toEqual({
                ...mockProduct,
                quantity: 1
            });
        });

        it('debe mostrar notificación de éxito al añadir producto', () => {
            // Simular clic en botón de añadir al carrito
            const addToCartButton = productDetailModal.modalContainer.querySelector('.btn-add-to-cart');
            addToCartButton.click();

            // Verificar notificación
            const cartUI = window.cartUI;
            expect(cartUI.notificationShown).toBe(true);
            expect(cartUI.notificationMessage).toBe(`${mockProduct.title} añadido al carrito`);
            expect(cartUI.notificationType).toBe('success');
        });

        it('debe manejar casos cuando cartService no está inicializado', () => {
            // Eliminar cartService
            productDetailModal.cartService = null;

            // Espiar console.warn
            const warnSpy = vi.spyOn(console, 'warn');

            // Simular clic en botón de añadir al carrito
            const addToCartButton = productDetailModal.modalContainer.querySelector('.btn-add-to-cart');
            addToCartButton.click();

            // Verificar advertencia en consola
            expect(warnSpy).toHaveBeenCalledWith('CartService no está inicializado');
        });

        it('debe manejar casos cuando cartUI no está inicializado', () => {
            // Eliminar cartUI
            window.cartUI = null;

            // Espiar console.warn
            const warnSpy = vi.spyOn(console, 'warn');

            // Simular clic en botón de añadir al carrito
            const addToCartButton = productDetailModal.modalContainer.querySelector('.btn-add-to-cart');
            addToCartButton.click();

            // Verificar advertencia en consola
            expect(warnSpy).toHaveBeenCalledWith('No se pudo añadir el producto o no hay notificación disponible');
        });

        it('debe manejar casos cuando el producto es inválido', () => {
            // Intentar añadir un producto sin ID
            const invalidProduct = { title: 'Producto sin ID' };
            
            // Espiar el método addToCart
            const addToCartSpy = vi.spyOn(mockCartService, 'addToCart');
            
            // Añadir producto inválido
            productDetailModal.addToCart(invalidProduct);

            // Verificar que no se llamó a addToCart
            expect(addToCartSpy).not.toHaveBeenCalled();
        });
    });

    describe('Método generateStarRating', () => {
        it('debe generar estrellas para ratings con decimales', () => {
            // Pruebas con ratings con decimales
            const testCases = [
                { rating: 3.2, fullStars: 3, halfStar: 0, emptyStars: 2 },
                { rating: 4.7, fullStars: 4, halfStar: 1, emptyStars: 0 },
                { rating: 2.5, fullStars: 2, halfStar: 1, emptyStars: 2 }
            ];

            testCases.forEach(({ rating, fullStars, halfStar, emptyStars }) => {
                const starsHTML = productDetailModal.generateStarRating(rating);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = starsHTML;

                const starElements = tempDiv.querySelectorAll('i');
                expect(starElements.length).toBe(5);

                const fullStarElements = tempDiv.querySelectorAll('.ri-star-fill');
                const halfStarElements = tempDiv.querySelectorAll('.ri-star-half-line');
                const emptyStarElements = tempDiv.querySelectorAll('.ri-star-line');

                expect(fullStarElements.length).toBe(fullStars);
                expect(halfStarElements.length).toBe(halfStar);
                expect(emptyStarElements.length).toBe(emptyStars);
            });
        });

        it('debe generar estrellas para ratings de números enteros', () => {
            const testCases = [
                { rating: 1, fullStars: 1, halfStar: 0, emptyStars: 4 },
                { rating: 5, fullStars: 5, halfStar: 0, emptyStars: 0 },
                { rating: 3, fullStars: 3, halfStar: 0, emptyStars: 2 }
            ];

            testCases.forEach(({ rating, fullStars, halfStar, emptyStars }) => {
                const starsHTML = productDetailModal.generateStarRating(rating);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = starsHTML;

                const starElements = tempDiv.querySelectorAll('i');
                expect(starElements.length).toBe(5);

                const fullStarElements = tempDiv.querySelectorAll('.ri-star-fill');
                const halfStarElements = tempDiv.querySelectorAll('.ri-star-half-line');
                const emptyStarElements = tempDiv.querySelectorAll('.ri-star-line');

                expect(fullStarElements.length).toBe(fullStars);
                expect(halfStarElements.length).toBe(halfStar);
                expect(emptyStarElements.length).toBe(emptyStars);
            });
        });
    });
});
