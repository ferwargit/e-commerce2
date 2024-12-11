import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CartUI from '../js/ui/CartUI.js';
import { CartService } from '../js/services/cart.js';

describe('CartUI', () => {
    let cartService;
    let cartUI;

    beforeEach(() => {
        // Crear un DOM mínimo
        document.body.innerHTML = `
            <div class="icons">
                <a href="#"><i class="ri-shopping-cart-line"></i></a>
            </div>
        `;

        // Crear mocks
        cartService = new CartService({ mockLocalStorage: true });
        
        // Usar fake timers para controlar timeouts
        vi.useFakeTimers();
        
        // Espiar console.log para verificar inicialización
        vi.spyOn(console, 'log');
    });

    afterEach(() => {
        // Limpiar mocks
        vi.restoreAllMocks();
        vi.useRealTimers(); // Cambiar de restoreAllTimers a useRealTimers
        
        // Limpiar el DOM
        document.body.innerHTML = '';
    });

    it('should log initialization message', () => {
        // Crear CartUI
        cartUI = new CartUI(cartService);

        // Verificar que se haya logueado el mensaje de inicialización
        expect(console.log).toHaveBeenCalledWith('Iniciando constructor de CartUI');
    });

    describe('showCartNotification', () => {
        beforeEach(() => {
            // Crear CartUI antes de cada prueba
            cartUI = new CartUI(cartService);
        });

        it('should create and show a notification with default type', () => {
            // Llamar al método de notificación
            cartUI.showCartNotification('Test message');

            // Verificar que se creó el contenedor de notificación
            const notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer).not.toBeNull();

            // Verificar el texto de la notificación
            const notificationText = notificationContainer.querySelector('.cart-notification-text');
            expect(notificationText.textContent).toBe('Test message');

            // Verificar la clase por defecto (success)
            expect(notificationContainer.classList.contains('success')).toBe(true);
            expect(notificationContainer.classList.contains('show')).toBe(true);
        });

        it('should create and show a notification with specified type', () => {
            // Llamar al método de notificación con un tipo específico
            cartUI.showCartNotification('Error message', 'error');

            // Verificar que se creó el contenedor de notificación
            const notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer).not.toBeNull();

            // Verificar el texto de la notificación
            const notificationText = notificationContainer.querySelector('.cart-notification-text');
            expect(notificationText.textContent).toBe('Error message');

            // Verificar la clase correspondiente al tipo
            expect(notificationContainer.classList.contains('error')).toBe(true);
            expect(notificationContainer.classList.contains('show')).toBe(true);
        });

        it('should remove notification after a timeout', () => {
            // Llamar al método de notificación
            cartUI.showCartNotification('Temporary message');

            // Verificar que la notificación existe inicialmente
            let notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer).not.toBeNull();
            expect(notificationContainer.classList.contains('show')).toBe(true);

            // Avanzar el tiempo
            vi.runAllTimers();

            // Verificar que la notificación ya no tiene la clase 'show'
            notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer.classList.contains('show')).toBe(false);
        });
    });
});
