class CartService {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.observers = [];
    }

    addToCart(product, cartUI = null) {
        console.log('Añadiendo producto al carrito');
        console.log('Productos actuales:', this.cart.length);
        console.log('Productos únicos:', this.cart.map(item => item.id));

        // Verificar límite de productos únicos (8 máximo)
        if (this.cart.length >= 8 && !this.cart.some(item => item.id === product.id)) {
            console.log('Límite de 8 productos únicos alcanzado');
            
            // Usar notificación de CartUI si está disponible
            if (cartUI && typeof cartUI.showCartNotification === 'function') {
                console.log('Intentando mostrar notificación');
                console.log('CartUI disponible:', !!cartUI);
                console.log('Método showCartNotification existe:', typeof cartUI.showCartNotification === 'function');
                
                // Intentar mostrar la notificación de varias maneras
                try {
                    // Cancelar cualquier notificación previa
                    const notification = document.querySelector('.cart-notification');
                    if (notification) {
                        notification.classList.remove('show');
                    }
                    
                    // Mostrar notificación de error
                    cartUI.showCartNotification('Máximo 8 productos únicos', 'error');
                } catch (error) {
                    console.error('Error al mostrar notificación:', error);
                }
            } else {
                console.log('CartUI no disponible o método no encontrado');
                console.log('CartUI:', cartUI);
            }
            
            return;
        }

        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            // Si ya existe, verificar límite de 3 unidades
            if (existingItem.quantity >= 3) {
                // Usar notificación de CartUI si está disponible
                if (cartUI && typeof cartUI.showCartNotification === 'function') {
                    cartUI.showCartNotification('Máximo 3 unidades por producto', 'warning');
                }
                return;
            }
            
            // Si ya existe, incrementar hasta un máximo de 3
            existingItem.quantity = Math.min(existingItem.quantity + 1, 3);
        } else {
            // Si es nuevo, añadir con cantidad 1
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.notifyObservers();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.notifyObservers();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            // Limitar la cantidad máxima a 3
            item.quantity = Math.min(Math.max(0, quantity), 3);
            
            if (item.quantity === 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.notifyObservers();
            }
        }
    }

    getCart() {
        return this.cart;
    }

    getTotal() {
        if (this.cart.length === 0) return 0;
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        // Cuenta productos únicos
        return this.cart.length;
    }

    getTotalProductQuantity() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addObserver(callback) {
        this.observers.push(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.cart));
    }

    // Método para obtener el límite máximo de cantidad
    getMaxQuantityLimit() {
        return 3;
    }

    // Método para obtener el límite máximo de productos únicos
    getMaxUniqueProductsLimit() {
        return 8;
    }

    emptyCart() {
        this.cart = [];
        this.saveCart();
        this.notifyObservers();
    }
}

export const cartService = new CartService();
