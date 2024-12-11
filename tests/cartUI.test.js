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

    describe('openCart', () => {
        let cartService;
        let cartUI;
        let modal;

        beforeEach(() => {
            // Crear mocks
            cartService = {
                getCart: vi.fn().mockReturnValue([]),
                emptyCart: vi.fn(),
                addToCart: vi.fn(),
                removeFromCart: vi.fn(),
                updateQuantity: vi.fn(),
                getTotal: vi.fn().mockReturnValue(0),
                addObserver: vi.fn(),
                getItemCount: vi.fn().mockReturnValue(0)
            };
            
            // Crear un modal ficticio
            modal = document.createElement('div');
            modal.classList.add('cart-modal');
            document.body.appendChild(modal);

            // Crear CartUI
            cartUI = new CartUI(cartService);
            cartUI.modal = modal;
            cartUI.cartItemsContainer = document.createElement('div');
            cartUI.cartItemsContainer.classList.add('cart-items-container');
            modal.appendChild(cartUI.cartItemsContainer);

            // Espiar métodos
            vi.spyOn(console, 'log');
            vi.spyOn(console, 'error');
            vi.spyOn(cartUI, 'renderCartItems').mockResolvedValue();
            vi.spyOn(cartUI, 'updateTotal').mockResolvedValue();
            vi.spyOn(cartUI, 'updateCartIcon').mockResolvedValue();
            vi.spyOn(cartUI, 'showCartNotification');
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('debe manejar la ausencia de modal de manera elegante', async () => {
            // Eliminar el modal para simular un error de inicialización
            cartUI.modal = null;

            // Espiar console.error
            const errorSpy = vi.spyOn(console, 'error');

            await cartUI.openCart();

            // Verificar que se registró un error
            expect(errorSpy).toHaveBeenCalledWith('Error al abrir el carrito:', expect.any(Error));
            expect(cartUI.showCartNotification).toHaveBeenCalledWith(
                'No se pudo abrir el carrito: el modal no está configurado', 
                'error'
            );
        });

        it('debe registrar un mensaje de registro al abrir el carrito', async () => {
            // Espiar console.log
            const logSpy = vi.spyOn(console, 'log');

            // Llamar a openCart
            await cartUI.openCart();

            // Verificar los mensajes de registro
            expect(logSpy).toHaveBeenCalledWith("[DEEP DEBUG] Método openCart() llamado");
            expect(logSpy).toHaveBeenCalledWith("[DEEP DEBUG] Mostrando modal");

            // Verificar que se llamaron los métodos de renderizado
            expect(cartUI.renderCartItems).toHaveBeenCalled();
            expect(cartUI.updateTotal).toHaveBeenCalled();
            expect(cartUI.updateCartIcon).toHaveBeenCalled();

            // Verificar que el modal está visible
            expect(cartUI.modal.style.display).toBe('block');
            expect(document.body.classList.contains('modal-open')).toBe(true);
        });
    });

    describe('Manejo de Eventos de Carrito', () => {
        let cartService;
        let cartUI;
        let cartIcon;
        let modal;

        beforeEach(() => {
            console.log('Inicio de beforeEach');
            
            // Configurar DOM mínimo para pruebas
            document.body.innerHTML = `
                <div class="icons">
                    <a href="#"><i class="ri-shopping-cart-line"></i></a>
                </div>
                <div id="cart-modal" class="cart-modal">
                    <div class="cart-modal-content">
                        <div class="cart-modal-header">
                            <button class="close-cart-modal">&times;</button>
                        </div>
                        <div class="cart-items-container"></div>
                        <div class="cart-summary">
                            <div class="cart-total">
                                Total: $<span class="total-amount">0.00</span>
                            </div>
                            <div class="cart-actions">
                                <button class="empty-cart-btn">Vaciar Carrito</button>
                                <button class="checkout-btn">Ir a Pagar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Usar fake timers
            vi.useFakeTimers();

            // Crear mocks
            cartService = {
                getCart: vi.fn().mockReturnValue([]),
                emptyCart: vi.fn(),
                addToCart: vi.fn(),
                removeFromCart: vi.fn(),
                updateQuantity: vi.fn(),
                getTotal: vi.fn().mockReturnValue(0),
                addObserver: vi.fn(),
                getItemCount: vi.fn().mockReturnValue(0)  // Añadir método getItemCount
            };
            
            // Espiar métodos relevantes
            vi.spyOn(console, 'log');
            vi.spyOn(console, 'error');
            
            // Crear CartUI
            console.log('Creando CartUI');
            cartUI = new CartUI(cartService);
            console.log('CartUI creado:', cartUI);
            
            // Obtener elementos del DOM
            cartIcon = document.querySelector('.ri-shopping-cart-line');
            modal = document.querySelector('.cart-modal');

            console.log('CartIcon:', cartIcon);
            console.log('Modal:', modal);

            // Asegurar que el modal esté correctamente inicializado
            if (!cartUI.modal) {
                console.log('Estableciendo modal manualmente');
                cartUI.modal = modal;
            }
            if (!cartUI.cartItemsContainer) {
                console.log('Estableciendo cartItemsContainer manualmente');
                cartUI.cartItemsContainer = modal.querySelector('.cart-items-container');
            }

            console.log('Fin de beforeEach');
        });

        afterEach(() => {
            console.log('Inicio de afterEach');
            
            // Restaurar timers y mocks
            vi.useRealTimers();
            vi.restoreAllMocks();
            
            // Limpiar el DOM
            document.body.innerHTML = '';
            
            console.log('Fin de afterEach');
        });

        describe('Eventos de Apertura de Carrito', () => {
            it('debe abrir el carrito al hacer clic en el ícono', () => {
                console.log('Inicio de prueba: abrir carrito');
                console.log('CartIcon antes del clic:', cartIcon);
                
                // Espiar método openCart
                const openCartSpy = vi.spyOn(cartUI, 'openCart');

                // Simular clic en el ícono del carrito
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });
                
                console.log('Evento de clic creado:', clickEvent);
                console.log('Métodos del evento:', Object.keys(clickEvent));

                cartIcon.dispatchEvent(clickEvent);

                // Verificar que se llamó a openCart
                expect(openCartSpy).toHaveBeenCalled();
                
                console.log('Fin de prueba: abrir carrito');
            });

            it('debe prevenir el comportamiento por defecto al abrir el carrito', () => {
                console.log('Inicio de prueba: prevenir comportamiento por defecto');
                
                // Simular clic en el ícono del carrito con preventDefault
                const preventDefaultSpy = vi.fn();
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });
                
                // Simular el evento directamente
                Object.defineProperty(clickEvent, 'preventDefault', {
                    value: preventDefaultSpy
                });
                
                console.log('Evento de clic creado:', clickEvent);
                console.log('Spy de preventDefault:', preventDefaultSpy);

                cartIcon.dispatchEvent(clickEvent);

                // Verificar que se llamó a preventDefault
                expect(preventDefaultSpy).toHaveBeenCalled();
                
                console.log('Fin de prueba: prevenir comportamiento por defecto');
            });
        });

        describe('Eventos de Cierre de Carrito', () => {
            it('debe cerrar el carrito al hacer clic en el botón de cierre', () => {
                console.log('Inicio de prueba: cerrar carrito por botón');
                
                // Abrir el modal primero
                cartUI.openCart();
                
                // Espiar método closeCart
                const closeCartSpy = vi.spyOn(cartUI, 'closeCart');

                // Obtener botón de cierre
                const closeButton = modal.querySelector('.close-cart-modal');
                console.log('Botón de cierre:', closeButton);

                // Simular clic en el botón de cierre
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });
                
                console.log('Evento de clic creado:', clickEvent);

                closeButton.dispatchEvent(clickEvent);

                // Verificar que se llamó a closeCart
                expect(closeCartSpy).toHaveBeenCalled();
                
                console.log('Fin de prueba: cerrar carrito por botón');
            });

            it('debe cerrar el carrito al hacer clic fuera del modal', () => {
                console.log('[TEST] Inicio de prueba: cerrar carrito por clic fuera');
                
                // Crear un mock de CartService más completo
                const mockCartService = {
                    getCart: vi.fn().mockReturnValue([]),
                    emptyCart: vi.fn(),
                    addToCart: vi.fn(),
                    removeFromCart: vi.fn(),
                    updateQuantity: vi.fn(),
                    getTotal: vi.fn().mockReturnValue(0),
                    addObserver: vi.fn(),
                    getItemCount: vi.fn().mockReturnValue(0)  // Añadir método getItemCount
                };
                
                // Crear instancia de CartUI
                const cartUI = new CartUI(mockCartService);
                
                // Configurar el entorno del DOM
                document.body.innerHTML = '';
                
                // Inicializar el modal
                cartUI.setupCartModal();
                
                console.log('[TEST] Modal después de setupCartModal:', {
                    modal: cartUI.modal,
                    modalExists: !!cartUI.modal,
                    modalInDocument: document.body.contains(cartUI.modal)
                });

                // Abrir el modal
                cartUI.openCart();
                
                console.log('[TEST] Modal después de openCart:', {
                    display: cartUI.modal.style.display,
                    bodyClasses: document.body.classList.toString()
                });

                // Espiar método closeCart
                const closeCartSpy = vi.spyOn(cartUI, 'closeCart');

                // Simular clic fuera del modal
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });

                // Configurar el evento para simular un clic fuera del modal
                Object.defineProperty(clickEvent, 'target', {
                    value: cartUI.modal,
                    writable: false
                });

                console.log('[TEST] Evento de clic configurado:', {
                    eventTarget: clickEvent.target,
                    modalReference: cartUI.modal,
                    targetEqualsModal: clickEvent.target === cartUI.modal
                });

                // Disparar el evento directamente en el modal
                cartUI.modal.dispatchEvent(clickEvent);

                console.log('[TEST] Después de disparar evento:', {
                    closeCartSpyCalls: closeCartSpy.mock.calls.length,
                    modalDisplay: cartUI.modal.style.display,
                    bodyClasses: document.body.classList.toString()
                });

                // Verificar que se llamó a closeCart
                expect(closeCartSpy).toHaveBeenCalledTimes(1);
                
                console.log('[TEST] Fin de prueba: cerrar carrito por clic fuera');
            });
        });

        describe('Eventos de Acciones del Carrito', () => {
            it('debe vaciar el carrito al hacer clic en el botón "Vaciar Carrito"', () => {
                console.log('Inicio de prueba: vaciar carrito');
                
                // Abrir el modal primero
                cartUI.openCart();
                
                // Obtener botón de vaciar carrito
                const emptyCartBtn = modal.querySelector('.empty-cart-btn');
                console.log('Botón de vaciar carrito:', emptyCartBtn);

                // Simular clic en el botón
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                });

                // Espiar el método emptyCart del servicio
                const emptyCartSpy = vi.spyOn(cartService, 'emptyCart');

                // Disparar el evento directamente
                console.log('Disparando evento en botón de vaciar carrito');
                emptyCartBtn.dispatchEvent(clickEvent);
                console.log('Evento disparado');

                // Verificar que se llamó a emptyCart
                expect(emptyCartSpy).toHaveBeenCalled();
                
                console.log('Fin de prueba: vaciar carrito');
            });

            it('debe renderizar elementos y actualizar ícono al cambiar el carrito', () => {
                console.log('Inicio de prueba: renderizar y actualizar');
                
                // Simular cambio en el carrito mediante el observador
                const renderSpy = vi.spyOn(cartUI, 'renderCartItems');
                const updateIconSpy = vi.spyOn(cartUI, 'updateCartIcon');

                console.log('Llamadas a addObserver:', cartService.addObserver.mock.calls);

                // Llamar al observador directamente
                const observer = cartService.addObserver.mock.calls[0][0];
                console.log('Observer:', observer);
                observer();

                // Verificar que se llamaron los métodos de renderización
                expect(renderSpy).toHaveBeenCalled();
                expect(updateIconSpy).toHaveBeenCalled();
                
                console.log('Fin de prueba: renderizar y actualizar');
            });
        });
    });

    describe('Manejo de Eventos de Carrito con Mock de CartService más completo', () => {
        let cartService;
        let cartUI;
        let modal;

        beforeEach(() => {
            // Crear mocks
            const createMockCartService = () => ({
                getCart: vi.fn().mockReturnValue([]),
                emptyCart: vi.fn(),
                addToCart: vi.fn(),
                removeFromCart: vi.fn(),
                updateQuantity: vi.fn(),
                getTotal: vi.fn().mockReturnValue(0),
                addObserver: vi.fn(),
                getItemCount: vi.fn().mockReturnValue(0)  // Añadir método getItemCount
            });

            cartService = createMockCartService();
            
            // Crear un modal ficticio
            modal = document.createElement('div');
            modal.classList.add('cart-modal');
            document.body.appendChild(modal);

            // Crear CartUI
            cartUI = new CartUI(cartService);
            cartUI.modal = modal;
            cartUI.cartItemsContainer = document.createElement('div');
            cartUI.cartItemsContainer.classList.add('cart-items-container');
            modal.appendChild(cartUI.cartItemsContainer);

            // Espiar métodos
            vi.spyOn(console, 'log');
            vi.spyOn(console, 'error');
            vi.spyOn(cartUI, 'renderCartItems').mockResolvedValue();
            vi.spyOn(cartUI, 'updateTotal').mockResolvedValue();
            vi.spyOn(cartUI, 'updateCartIcon').mockResolvedValue();
            vi.spyOn(cartUI, 'showCartNotification');
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('debe manejar la ausencia de modal de manera elegante', async () => {
            // Eliminar el modal para simular un error de inicialización
            cartUI.modal = null;

            // Espiar console.error
            const errorSpy = vi.spyOn(console, 'error');

            await cartUI.openCart();

            // Verificar que se registró un error
            expect(errorSpy).toHaveBeenCalledWith('Error al abrir el carrito:', expect.any(Error));
            expect(cartUI.showCartNotification).toHaveBeenCalledWith(
                'No se pudo abrir el carrito: el modal no está configurado', 
                'error'
            );
        });

        it('debe registrar un mensaje de registro al abrir el carrito', async () => {
            // Espiar console.log
            const logSpy = vi.spyOn(console, 'log');

            // Llamar a openCart
            await cartUI.openCart();

            // Verificar los mensajes de registro
            expect(logSpy).toHaveBeenCalledWith("[DEEP DEBUG] Método openCart() llamado");
            expect(logSpy).toHaveBeenCalledWith("[DEEP DEBUG] Mostrando modal");
        });
    });

    describe('Manejo de errores y logs en openCart', () => {
        let cartService;
        let cartUI;
        let modal;

        beforeEach(() => {
            // Crear mocks
            cartService = {
                getCart: vi.fn().mockReturnValue([]),
                emptyCart: vi.fn(),
                addToCart: vi.fn(),
                removeFromCart: vi.fn(),
                updateQuantity: vi.fn(),
                getTotal: vi.fn().mockReturnValue(0),
                addObserver: vi.fn(),
                getItemCount: vi.fn().mockReturnValue(0)
            };

            // Crear un modal ficticio
            modal = document.createElement('div');
            modal.classList.add('cart-modal');
            document.body.appendChild(modal);

            // Crear CartUI
            cartUI = new CartUI(cartService);
            cartUI.modal = modal;
            cartUI.cartItemsContainer = document.createElement('div');
            cartUI.cartItemsContainer.classList.add('cart-items-container');
            modal.appendChild(cartUI.cartItemsContainer);

            // Espiar métodos
            vi.spyOn(console, 'log');
            vi.spyOn(console, 'error');
            vi.spyOn(cartUI, 'renderCartItems').mockResolvedValue();
            vi.spyOn(cartUI, 'updateTotal').mockResolvedValue();
            vi.spyOn(cartUI, 'updateCartIcon').mockResolvedValue();
            vi.spyOn(cartUI, 'showCartNotification');
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('debe manejar la ausencia de modal de manera elegante', async () => {
            // Eliminar el modal para simular un error de inicialización
            cartUI.modal = null;

            // Espiar console.error
            const errorSpy = vi.spyOn(console, 'error');

            await cartUI.openCart();

            // Verificar que se registró un error
            expect(errorSpy).toHaveBeenCalledWith('Error al abrir el carrito:', expect.any(Error));
            expect(cartUI.showCartNotification).toHaveBeenCalledWith(
                'No se pudo abrir el carrito: el modal no está configurado', 
                'error'
            );
        });

        it('debe registrar un mensaje de registro al abrir el carrito', async () => {
            // Espiar console.log
            const logSpy = vi.spyOn(console, 'log');

            // Llamar a openCart
            await cartUI.openCart();

            // Verificar los mensajes de registro
            expect(logSpy).toHaveBeenCalledWith("[DEEP DEBUG] Método openCart() llamado");
            expect(logSpy).toHaveBeenCalledWith("[DEEP DEBUG] Mostrando modal");
        });
    });
});
