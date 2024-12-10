class CartUI {
    constructor(cartService) {
        this.cartService = cartService;
        this.cartIcon = document.querySelector('.ri-shopping-cart-line');
        this.modal = null;
        this.cartItemsContainer = null;
        this.emptyCartBtn = null;
        this.cartActionsContainer = null;
        
        // Crear contenedor de notificaciones
        this.createNotificationContainer();
        
        this.setupCartModal();
        this.setupEventListeners();
        this.updateCartIcon();
    }

    createNotificationContainer() {
        // Crear contenedor de notificaciones si no existe
        const existingNotification = document.querySelector('.cart-notification');
        if (!existingNotification) {
            const notificationContainer = document.createElement('div');
            notificationContainer.className = 'cart-notification';
            notificationContainer.innerHTML = `
                <div class="cart-notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="cart-notification-text">Producto añadido al carrito</span>
            `;
            document.body.appendChild(notificationContainer);
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

        console.log('Contenedor de notificación encontrado/creado');

        // Prioridad de notificaciones: error > warning > success
        const currentType = notification.classList.contains('error') ? 'error' : 
                            notification.classList.contains('warning') ? 'warning' : 'success';
        
        const typePriority = {
            'error': 3,
            'warning': 2,
            'success': 1
        };

        // Forzar mostrar la notificación verde, ignorando la prioridad anterior
        console.log('Tipo actual de notificación:', currentType);
        console.log('Prioridad de tipo actual:', typePriority[currentType]);
        console.log('Prioridad de nuevo tipo:', typePriority[type]);

        // Siempre mostrar la notificación verde
        if (type === 'success') {
            console.log('Forzando notificación verde');
            
            // Limpiar clases anteriores
            notification.classList.remove('success', 'warning', 'error');
            
            // Añadir clase de tipo de notificación
            notification.classList.add(type);
            console.log('Clase añadida:', type);

            const notificationText = notification.querySelector('.cart-notification-text');
            const notificationIcon = notification.querySelector('.cart-notification-icon');
            
            // Actualizar texto de la notificación
            notificationText.textContent = message;
            console.log('Texto actualizado:', message);

            // Cambiar ícono para success
            const successIconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            
            notificationIcon.innerHTML = successIconSvg;
            console.log('Ícono actualizado');
            
            // Forzar reflow para asegurar transición
            notification.offsetHeight;
            
            // Mostrar notificación
            notification.classList.add('show');
            console.log('Notificación mostrada');
            
            // Ocultar después de 3 segundos
            setTimeout(() => {
                notification.classList.remove('show');
                console.log('Notificación ocultada');
            }, 3000);

            return;
        }

        // Si no es una notificación verde, mantener la lógica de prioridad original
        if (typePriority[type] < typePriority[currentType]) {
            console.log('Notificación de menor prioridad, ignorando');
            return;
        }

        // Limpiar clases anteriores
        notification.classList.remove('success', 'warning', 'error');
        
        // Añadir clase de tipo de notificación
        notification.classList.add(type);
        console.log('Clase añadida:', type);

        const notificationText = notification.querySelector('.cart-notification-text');
        const notificationIcon = notification.querySelector('.cart-notification-icon');
        
        // Actualizar texto de la notificación
        notificationText.textContent = message;
        console.log('Texto actualizado:', message);

        // Cambiar ícono según el tipo de notificación
        let iconSvg = '';
        switch(type) {
            case 'warning':
                iconSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                `;
                break;
            case 'error':
                iconSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                `;
                break;
        }
        
        notificationIcon.innerHTML = iconSvg;
        console.log('Ícono actualizado');
        
        // Forzar reflow para asegurar transición
        notification.offsetHeight;
        
        // Mostrar notificación
        notification.classList.add('show');
        console.log('Notificación mostrada');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            console.log('Notificación ocultada');
        }, 3000);
    }

    addToCart(product) {
        try {
            // Verificar si el producto ya está en el carrito
            const existingProduct = this.cartService.getCart().find(item => item.id === product.id);
            
            // Verificar límite de 8 productos únicos antes de añadir
            if (this.cartService.getCart().length >= 8 && !this.cartService.getCart().some(item => item.id === product.id)) {
                this.showCartNotification('Máximo 8 productos únicos', 'error');
                return;
            }

            // Si ya existe, verificar límite de 3 unidades
            if (existingProduct && existingProduct.quantity >= 3) {
                this.showCartNotification('Máximo 3 unidades por producto', 'warning');
                return;
            }

            // Añadir al carrito
            this.cartService.addToCart(product, this);
            
            // Mostrar notificación verde
            this.showCartNotification(`${product.title} añadido al carrito`, 'success');
            this.renderCartItems();
            this.updateCartIcon();
        } catch (error) {
            console.error('Error al añadir producto:', error);
        }
    }

    setupCartModal() {
        // Crear el modal del carrito
        const modal = document.createElement('div');
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <div class="header-content">
                        <h3>Carrito de Compras</h3>
                        <button class="close-cart">&times;</button>
                    </div>
                </div>
                <div class="cart-items"></div>
                <div class="cart-actions" style="display: none;">
                    <button class="btn-empty-cart">Vaciar Carrito</button>
                </div>
                <div class="cart-total">
                    <span>Total: $<span class="total-amount">0</span></span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.cartItemsContainer = modal.querySelector('.cart-items');
        this.emptyCartBtn = modal.querySelector('.btn-empty-cart');
        this.cartActionsContainer = modal.querySelector('.cart-actions');
    }

    setupEventListeners() {
        // Abrir modal al hacer clic en el ícono del carrito
        this.cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });

        // Cerrar modal
        this.modal.querySelector('.close-cart').addEventListener('click', () => {
            this.closeCart();
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeCart();
            }
        });

        // Suscribirse a cambios en el carrito
        this.cartService.addObserver(() => {
            this.updateCartIcon();
            this.renderCartItems();
        });

        // Agregar evento al botón de vaciar carrito
        this.emptyCartBtn.addEventListener('click', () => {
            this.cartService.emptyCart();
            this.updateTotal();
        });
    }

    openCart() {
        this.modal.style.display = 'block';
        document.body.classList.add('modal-open');
        this.renderCartItems();
    }

    closeCart() {
        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    updateCartIcon() {
        const count = this.cartService.getItemCount();
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
        const total = this.cartService.getTotal();
        const totalElement = this.modal.querySelector('.total-amount');
        
        // Asegurar que el total sea visible y actualizado
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    }
}

export default CartUI;
