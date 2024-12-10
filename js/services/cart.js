class CartService {
    constructor() {
        // Usar un método para obtener el carrito que pueda ser mockeado
        this.cart = this.getInitialCart();
        this.observers = [];
    }

    // Método para obtener el carrito inicial, que puede ser sobrescrito en pruebas
    getInitialCart() {
        try {
          // Verificar si localStorage está disponible
          if (typeof localStorage === 'undefined') {
            console.warn('localStorage no está disponible');
            return [];
          }

          const storedCart = localStorage.getItem('cart');
          return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
          console.error('No se pudo obtener el carrito inicial de localStorage:', error);
          return [];
        }
    }

    addToCart(product, cartUI = null) {
        console.log('Añadiendo producto al carrito');
        console.log('Productos actuales:', this.cart.length);
        console.log('Productos únicos:', this.cart.map(item => item.id));

        // Verificar límite de productos únicos
        if (this.cart.length >= 8 && !this.cart.some(item => item.id === product.id)) {
            console.log('Límite de 8 productos únicos alcanzado');
            
            // Usar notificación de CartUI si está disponible
            if (cartUI && typeof cartUI.showCartNotification === 'function') {
                try {
                    cartUI.showCartNotification('Máximo 8 productos únicos', 'warning');
                } catch (error) {
                    console.error('Error al mostrar notificación:', error);
                }
            } else {
                console.log('CartUI no disponible o método no encontrado');
                console.log('CartUI:', cartUI);
            }
            
            return false;
        }

        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            // Si ya existe, verificar límite de 3 unidades
            if (existingItem.quantity >= 3) {
                // Usar notificación de CartUI si está disponible
                if (cartUI && typeof cartUI.showCartNotification === 'function') {
                    cartUI.showCartNotification('Máximo 3 unidades por producto', 'warning');
                }
                return false;
            }
            
            // Si ya existe, incrementar hasta un máximo de 3
            existingItem.quantity = Math.min(existingItem.quantity + 1, 3);
        } else {
            // Si es nuevo, añadir con cantidad 1
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.notifyObservers();
        return true;
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
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.warn('No se pudo guardar el carrito en localStorage:', error);
        }
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

export { CartService };
export const cartService = new CartService();
