class CartUI {
    constructor(cartService) {
        console.log('Iniciando constructor de CartUI');
        this.cartService = cartService;
        this.isAddingToCart = false;  // Nueva bandera para prevenir múltiples clics
        this.lastAddedProductId = null;
        this.lastAddedTimestamp = 0;
        
        // Depuración de selectores de ícono de carrito
        console.log('Buscando ícono de carrito');
        console.log('Selector 1:', document.querySelector('.ri-shopping-cart-line'));
        console.log('Selector 2:', document.querySelector('.icons a i.ri-shopping-cart-line'));
        console.log('Selector 3:', document.querySelector('header .icons a i.ri-shopping-cart-line'));
        console.log('Todos los íconos de carrito:', document.querySelectorAll('.ri-shopping-cart-line, .icons a i.ri-shopping-cart-line'));
        
        // Buscar ícono del carrito en múltiples selectores
        this.cartIcon = document.querySelector('.ri-shopping-cart-line') || 
                        document.querySelector('.icons a i.ri-shopping-cart-line') || 
                        document.querySelector('header .icons a i.ri-shopping-cart-line');
        
        console.log('Ícono de carrito encontrado:', this.cartIcon);
        
        this.modal = null;
        this.cartItemsContainer = null;
        this.emptyCartBtn = null;
        this.cartActionsContainer = null;

        // Inicializar elementos de notificación temprano
        this.initializeNotificationElement();

        // Crear contenedor de notificaciones
        this.createNotificationContainer();
        
        this.setupCartModal();
        this.setupEventListeners();
        this.updateCartIcon();

        // Si no se encuentra el ícono del carrito, intentar configurar evento en todos los enlaces
        if (!this.cartIcon) {
            console.warn('No se encontró el ícono del carrito. Buscando enlaces alternativos.');
            const cartLinks = document.querySelectorAll('a[href="#"]');
            console.log('Enlaces encontrados:', cartLinks.length);
            
            cartLinks.forEach((link, index) => {
                console.log(`Revisando enlace ${index}:`, link);
                const cartIcon = link.querySelector('i.ri-shopping-cart-line');
                console.log(`Ícono en enlace ${index}:`, cartIcon);
                
                if (cartIcon) {
                    link.addEventListener('click', (e) => {
                        console.log('Clic en enlace de carrito alternativo');
                        e.preventDefault();
                        this.openCart();
                    });
                }
            });
        } else {
            // Añadir evento al ícono del carrito encontrado
            this.cartIcon.addEventListener('click', (e) => {
                console.log('Clic en ícono de carrito');
                e.preventDefault();
                this.openCart();
            });
        }
    }

    initializeNotificationElement() {
        // Crear contenedor de notificación si no existe
        let notification = document.querySelector('.cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `
                <div class="cart-notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="cart-notification-text"></span>
            `;
            document.body.appendChild(notification);
        }
    }

    createNotificationContainer() {
        // No hacer nada si ya existe el contenedor de notificación
        if (document.querySelector('.cart-notification')) {
            return;
        }
    }

    showCartNotification(message, type = 'success') {
        console.log('Método showCartNotification llamado');
        console.log('Mensaje:', message);
        console.log('Tipo:', type);

        // Crear el contenedor de notificación si no existe
        let notification = document.querySelector('.cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `
                <div class="cart-notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="cart-notification-text"></span>
            `;
            document.body.appendChild(notification);
        }

        // Limpiar clases anteriores
        notification.classList.remove('success', 'warning', 'error');
        
        // Añadir clase de tipo de notificación
        notification.classList.add(type);

        const notificationText = notification.querySelector('.cart-notification-text');
        const notificationIcon = notification.querySelector('.cart-notification-icon');
        
        // Actualizar texto de la notificación
        notificationText.textContent = message;

        // Mostrar notificación
        notification.classList.add('show');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    addToCart(product) {
        // Prevenir múltiples clics rápidos del mismo producto
        const currentTime = Date.now();
        const MIN_CLICK_INTERVAL = 300;  // 300ms entre clics

        if (this.isAddingToCart) {
            console.warn('Operación en progreso. Por favor, espere.');
            return;
        }

        // Prevenir clics rápidos del mismo producto
        if (this.lastAddedProductId === product.id && 
            currentTime - this.lastAddedTimestamp < MIN_CLICK_INTERVAL) {
            console.warn('Clics demasiado rápidos. Espere un momento.');
            return;
        }

        try {
            this.isAddingToCart = true;  // Bloquear más adiciones

            // Verificar si el producto ya está en el carrito
            const cart = this.cartService.getCart();
            const existingProduct = cart.find(item => item.id === product.id);
            
            console.log('Producto a añadir:', product);
            console.log('Carrito actual:', cart);
            console.log('Producto existente:', existingProduct);

            // Verificar límite de 8 productos únicos antes de añadir
            if (cart.length >= 8 && !cart.some(item => item.id === product.id)) {
                this.showCartNotification('Máximo 8 productos únicos', 'error');
                this.isAddingToCart = false;
                return;
            }

            // Si ya existe, verificar límite de 3 unidades
            if (existingProduct) {
                console.log('Cantidad actual del producto:', existingProduct.quantity);
                
                if (existingProduct.quantity >= 3) {
                    this.showCartNotification('Máximo 3 unidades por producto', 'warning');
                    this.isAddingToCart = false;
                    return;
                }
            }

            // Añadir al carrito
            this.cartService.addToCart(product, this);
            
            // Actualizar timestamps
            this.lastAddedProductId = product.id;
            this.lastAddedTimestamp = currentTime;

            // Mostrar notificación verde
            this.showCartNotification(`${product.title} añadido al carrito`, 'success');
            this.renderCartItems();
            this.updateCartIcon();
        } catch (error) {
            console.error('Error al añadir producto:', error);
        } finally {
            // Siempre desbloquear, incluso si hay un error
            this.isAddingToCart = false;
        }
    }

    setupCartModal() {
        console.log('Configurando modal del carrito');
        
        // Verificar si ya existe un modal del carrito en el documento
        const existingModal = document.querySelector('.cart-modal');
        if (existingModal) {
            console.log('Modal del carrito ya existente');
            this.modal = existingModal;
        } else {
            console.log('Creando nuevo modal del carrito');
            this.modal = document.createElement('div');
            this.modal.className = 'cart-modal';
            this.modal.innerHTML = `
                <div class="cart-modal-content">
                    <div class="cart-modal-header">
                        <div class="header-content">
                            <h3>Tu Carrito</h3>
                            <button class="close-cart-modal">&times;</button>
                        </div>
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
            `;
            
            // Añadir evento de cierre al botón
            const closeButton = this.modal.querySelector('.close-cart-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.closeCart();
                });
            }
            
            // Añadir evento de clic fuera del modal para cerrarlo
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeCart();
                }
            });
            
            document.body.appendChild(this.modal);
            console.log('Modal del carrito añadido al body');
        }

        // Inicializar referencias a elementos del modal
        this.cartItemsContainer = this.modal.querySelector('.cart-items-container');
        this.emptyCartBtn = this.modal.querySelector('.empty-cart-btn');
        this.cartActionsContainer = this.modal.querySelector('.cart-actions');

        console.log('Referencias del modal:', {
            cartItemsContainer: this.cartItemsContainer,
            emptyCartBtn: this.emptyCartBtn,
            cartActionsContainer: this.cartActionsContainer
        });

        // Configurar eventos para el botón de vaciar carrito
        if (this.emptyCartBtn) {
            this.emptyCartBtn.addEventListener('click', () => {
                this.cartService.emptyCart();
                this.updateTotal();
                this.renderCartItems();
            });
        }

        // Inicializar el modal con el estado actual del carrito
        this.renderCartItems();
        this.updateTotal();
    }

    setupEventListeners() {
        console.log('Configurando event listeners');
        
        // Abrir modal al hacer clic en el ícono del carrito
        const cartIcons = document.querySelectorAll('.ri-shopping-cart-line, .icons a i.ri-shopping-cart-line');
        cartIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                console.log('Clic en ícono de carrito');
                e.preventDefault();
                this.openCart();
            });
        });

        // Asegurar que el modal tenga un botón de cierre
        const closeButton = this.modal.querySelector('.close-cart-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                console.log('Botón de cerrar carrito clickeado');
                this.closeCart();
            });
        } else {
            console.warn('No se encontró botón para cerrar el carrito');
        }

        // Suscribirse a cambios en el carrito
        this.cartService.addObserver(() => {
            this.renderCartItems();
            this.updateCartIcon();
        });
    }

    openCart() {
        console.log('Método openCart() llamado');
        console.log('Modal:', this.modal);
        
        if (!this.modal) {
            console.error('El modal del carrito no está inicializado');
            return;
        }
        
        this.modal.style.display = 'block';
        document.body.classList.add('modal-open');
        this.renderCartItems();
        
        console.log('Carrito abierto');
    }

    closeCart() {
        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    updateCartIcon() {
        const count = this.cartService.getItemCount();
        
        // Si no hay ícono de carrito, no hacer nada
        if (!this.cartIcon) {
            console.warn('No se puede actualizar ícono de carrito: ícono no encontrado');
            return;
        }

        // Actualizar el número en el ícono del carrito
        let badge = this.cartIcon.querySelector('.cart-count');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-count';
                this.cartIcon.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    }

    renderCartItems() {
        const cart = this.cartService.getCart();
        this.cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            this.cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            
            // Establecer total a 0
            this.modal.querySelector('.total-amount').textContent = '0.00';
            
            // Ocultar botón de vaciar carrito
            if (this.cartActionsContainer) {
                this.cartActionsContainer.style.display = 'none';
            }
            return;
        }

        // Mostrar botón de vaciar carrito
        if (this.cartActionsContainer) {
            this.cartActionsContainer.style.display = 'flex';
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            // Calcular subtotal del producto
            const subtotal = (item.price * item.quantity).toFixed(2);
            
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>Precio unitario: $${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-item">Eliminar</button>
                    </div>
                    <div class="item-subtotal">
                        <span>Subtotal: $<span class="subtotal-amount">${subtotal}</span></span>
                    </div>
                </div>
            `;

            // Eventos para los botones de cantidad
            const minusBtn = itemElement.querySelector('.minus');
            const plusBtn = itemElement.querySelector('.plus');
            const removeBtn = itemElement.querySelector('.remove-item');
            const subtotalElement = itemElement.querySelector('.subtotal-amount');

            minusBtn.addEventListener('click', () => {
                if (item.quantity > 1) {
                    this.cartService.updateQuantity(item.id, item.quantity - 1);
                    
                    // Actualizar subtotal
                    const newSubtotal = ((item.price * (item.quantity - 1)).toFixed(2));
                    subtotalElement.textContent = newSubtotal;
                    
                    this.updateTotal();
                }
            });

            plusBtn.addEventListener('click', () => {
                if (item.quantity < 3) {
                    this.cartService.updateQuantity(item.id, item.quantity + 1);
                    
                    // Actualizar subtotal
                    const newSubtotal = ((item.price * (item.quantity + 1)).toFixed(2));
                    subtotalElement.textContent = newSubtotal;
                    
                    this.updateTotal();
                } else {
                    this.showCartNotification('Máximo 3 unidades por producto', 'warning');
                }
            });

            removeBtn.addEventListener('click', () => {
                this.cartService.removeFromCart(item.id);
                this.updateTotal();
            });

            this.cartItemsContainer.appendChild(itemElement);
        });

        // Actualizar total siempre
        this.updateTotal();
    }

    updateTotal() {
        const totalElement = this.modal.querySelector('.total-amount');
        if (totalElement) {
            const total = this.cartService.getTotal();
            totalElement.textContent = total.toFixed(2);
        }

        // Actualizar icono del carrito
        this.updateCartIcon();
    }
}

export default CartUI;
