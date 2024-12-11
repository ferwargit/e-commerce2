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

    it('debe registrar mensaje de inicialización', () => {
        // Crear CartUI
        cartUI = new CartUI(cartService);

        // Verificar que se haya logueado el mensaje de inicialización
        expect(console.log).toHaveBeenCalledWith('Iniciando constructor de CartUI');
    });

    describe('Inicialización de CartUI', () => {
        let cartService;
        let cartUI;

        beforeEach(() => {
            // Crear un DOM mínimo con elementos necesarios
            document.body.innerHTML = `
                <div class="icons">
                    <a href="#"><i class="ri-shopping-cart-line"></i></a>
                </div>
                <div id="cart-modal"></div>
            `;

            // Crear mocks
            cartService = new CartService({ mockLocalStorage: true });
        });

        afterEach(() => {
            // Limpiar el DOM
            document.body.innerHTML = '';
            vi.restoreAllMocks();
        });

        it('debe inicializar correctamente el ícono del carrito', () => {
            cartUI = new CartUI(cartService);

            // Verificar que se encontró el ícono del carrito
            const cartIcon = document.querySelector('.ri-shopping-cart-line');
            expect(cartIcon).not.toBeNull();
            expect(cartUI.cartIcon).toBe(cartIcon);
        });

        it('debe crear el contenedor de notificaciones', () => {
            cartUI = new CartUI(cartService);

            // Verificar creación del contenedor de notificaciones
            const notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer).not.toBeNull();
        });

        it('debe configurar el modal del carrito', () => {
            cartUI = new CartUI(cartService);

            // Verificar que se configuró el modal
            expect(cartUI.modal).not.toBeNull();
            expect(cartUI.cartItemsContainer).not.toBeNull();
            expect(cartUI.emptyCartBtn).not.toBeNull();
        });

        it('debe añadir evento de clic al ícono del carrito', () => {
            const clickSpy = vi.fn();
            const cartIcon = document.querySelector('.ri-shopping-cart-line');
            cartIcon.addEventListener('click', clickSpy);

            cartUI = new CartUI(cartService);

            // Simular clic en el ícono
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            });
            cartIcon.dispatchEvent(clickEvent);

            // Verificar que se llamó al evento
            expect(clickSpy).toHaveBeenCalled();
        });

        it('debe manejar la ausencia del ícono del carrito de manera elegante', () => {
            // Limpiar el DOM antes de la prueba
            document.body.innerHTML = '';

            // Espiar console.warn para verificar el manejo de errores
            const warnSpy = vi.spyOn(console, 'warn');

            // Crear CartUI sin ícono de carrito
            cartUI = new CartUI(cartService);

            // Verificar que se emitió un warning
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No se encontró el ícono del carrito'));
            
            // Verificar que no hay errores al intentar métodos que usan cartIcon
            expect(() => {
                cartUI.updateCartIcon();
            }).not.toThrow();
        });
    });

    describe('showCartNotification', () => {
        beforeEach(() => {
            // Crear CartUI antes de cada prueba
            cartUI = new CartUI(cartService);
        });

        it('debe crear y mostrar una notificación con tipo por defecto', () => {
            // Llamar al método de notificación
            cartUI.showCartNotification('Mensaje de prueba');

            // Verificar que se creó el contenedor de notificación
            const notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer).not.toBeNull();

            // Verificar el texto de la notificación
            const notificationText = notificationContainer.querySelector('.cart-notification-text');
            expect(notificationText.textContent).toBe('Mensaje de prueba');

            // Verificar la clase por defecto (success)
            expect(notificationContainer.classList.contains('success')).toBe(true);
            expect(notificationContainer.classList.contains('show')).toBe(true);
        });

        it('debe crear y mostrar una notificación con tipo específico', () => {
            // Llamar al método de notificación con un tipo específico
            cartUI.showCartNotification('Mensaje de error', 'error');

            // Verificar que se creó el contenedor de notificación
            const notificationContainer = document.querySelector('.cart-notification');
            expect(notificationContainer).not.toBeNull();

            // Verificar el texto de la notificación
            const notificationText = notificationContainer.querySelector('.cart-notification-text');
            expect(notificationText.textContent).toBe('Mensaje de error');

            // Verificar la clase correspondiente al tipo
            expect(notificationContainer.classList.contains('error')).toBe(true);
            expect(notificationContainer.classList.contains('show')).toBe(true);
        });

        it('debe eliminar la notificación después de un tiempo de espera', () => {
            // Llamar al método de notificación
            cartUI.showCartNotification('Mensaje temporal');

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
        it('debe agregar un badge de conteo de carrito cuando hay elementos en el carrito', () => {
            // Simular que hay 3 elementos en el carrito
            cartService.getItemCount.mockReturnValue(3);
            
            // Llamar a updateCartIcon
            cartUI.updateCartIcon();

            // Verificar que se haya agregado el badge
            const badge = cartIconElement.querySelector('.cart-count');
            expect(badge).not.toBeNull();
            expect(badge.textContent).toBe('3');
        });

        it('debe eliminar el badge de conteo de carrito cuando el carrito está vacío', () => {
            // Simular carrito vacío
            cartService.getItemCount.mockReturnValue(0);
            
            // Llamar a updateCartIcon
            cartUI.updateCartIcon();

            // Verificar que no exista badge
            const badge = cartIconElement.querySelector('.cart-count');
            expect(badge).toBeNull();
        });

        it('debe actualizar el conteo del badge de manera dinámica', () => {
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

        it('debe manejar llamadas múltiples sin crear múltiples badges', () => {
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
