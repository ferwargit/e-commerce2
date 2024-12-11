import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CartUI from '../js/ui/CartUI.js';
import { CartService } from '../js/services/cart.js';

describe('CartUI', () => {
    let cartService;
    let cartUI;
    let cartIconElement;

    beforeEach(() => {
        // Crear un DOM mínimo con ícono de carrito
        document.body.innerHTML = `
            <div class="icons">
                <a href="#"><i class="ri-shopping-cart-line"></i></a>
            </div>
        `;

        // Usar fake timers
        vi.useFakeTimers();

        // Crear mocks
        cartService = new CartService({ mockLocalStorage: true });
        
        // Espiar getItemCount para controlar el número de elementos
        vi.spyOn(cartService, 'getItemCount');
        
        // Crear CartUI
        cartUI = new CartUI(cartService);
        
        // Obtener el ícono del carrito
        cartIconElement = document.querySelector('.ri-shopping-cart-line');
    });

    afterEach(() => {
        // Restaurar timers reales
        vi.useRealTimers();

        // Limpiar el DOM
        document.body.innerHTML = '';
        
        // Restaurar mocks
        vi.restoreAllMocks();
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

    describe('updateCartIcon', () => {
        it('should add a cart count badge when items are in the cart', () => {
            // Simular que hay 3 elementos en el carrito
            cartService.getItemCount.mockReturnValue(3);
            
            // Llamar a updateCartIcon
            cartUI.updateCartIcon();

            // Verificar que se haya agregado el badge
            const badge = cartIconElement.querySelector('.cart-count');
            expect(badge).not.toBeNull();
            expect(badge.textContent).toBe('3');
        });

        it('should remove cart count badge when cart is empty', () => {
            // Simular carrito vacío
            cartService.getItemCount.mockReturnValue(0);
            
            // Llamar a updateCartIcon
            cartUI.updateCartIcon();

            // Verificar que no exista badge
            const badge = cartIconElement.querySelector('.cart-count');
            expect(badge).toBeNull();
        });

        it('should update badge count dynamically', () => {
            // Simular diferentes números de elementos
            cartService.getItemCount.mockReturnValueOnce(2);
            cartUI.updateCartIcon();

            let badge = cartIconElement.querySelector('.cart-count');
            expect(badge.textContent).toBe('2');

            // Cambiar número de elementos
            cartService.getItemCount.mockReturnValueOnce(5);
            cartUI.updateCartIcon();

            badge = cartIconElement.querySelector('.cart-count');
            expect(badge.textContent).toBe('5');
        });

        it('should handle multiple calls without creating multiple badges', () => {
            // Simular carrito con elementos
            cartService.getItemCount.mockReturnValue(3);
            
            // Llamar múltiples veces a updateCartIcon
            cartUI.updateCartIcon();
            cartUI.updateCartIcon();
            cartUI.updateCartIcon();

            // Verificar que solo exista un badge
            const badges = cartIconElement.querySelectorAll('.cart-count');
            expect(badges.length).toBe(1);
            expect(badges[0].textContent).toBe('3');
        });
    });
});
