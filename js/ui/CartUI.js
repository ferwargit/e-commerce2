class CartUI {
    constructor(cartService) {
        this.cartService = cartService;
        this.cartIcon = document.querySelector('.ri-shopping-cart-line');
        this.setupCartModal();
        this.setupEventListeners();
        this.updateCartIcon();
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
                <div class="cart-total">
                    <span>Total: $<span class="total-amount">0</span></span>
                </div>
                <div class="cart-actions">
                    <button class="btn-empty-cart">Vaciar Carrito</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.cartItemsContainer = modal.querySelector('.cart-items');
        this.emptyCartBtn = modal.querySelector('.btn-empty-cart');
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
            this.modal.querySelector('.total-amount').textContent = '0.00';
            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-item">Eliminar</button>
                    </div>
                </div>
            `;

            // Eventos para los botones de cantidad
            const minusBtn = itemElement.querySelector('.minus');
            const plusBtn = itemElement.querySelector('.plus');
            const removeBtn = itemElement.querySelector('.remove-item');

            minusBtn.addEventListener('click', () => {
                this.cartService.updateQuantity(item.id, item.quantity - 1);
                this.updateTotal();
            });

            plusBtn.addEventListener('click', () => {
                this.cartService.updateQuantity(item.id, item.quantity + 1);
                this.updateTotal();
            });

            removeBtn.addEventListener('click', () => {
                this.cartService.removeFromCart(item.id);
                this.updateTotal();
            });

            this.cartItemsContainer.appendChild(itemElement);
        });

        this.updateTotal();
    }

    updateTotal() {
        const total = this.cartService.getTotal();
        this.modal.querySelector('.total-amount').textContent = total.toFixed(2);
    }
}

export default CartUI;
