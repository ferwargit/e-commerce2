class CartService {
    static MAX_UNIQUE_PRODUCTS = 8;
    static MAX_PRODUCT_QUANTITY = 3;

    constructor(options = {}) {
        this.logger = options.logger || console;
        this.observers = [];
        this.cart = this.initializeCart(options);
    }

    // Método de inicialización con control de opciones
    initializeCart(options = {}) {
        const { 
            initialCart = null, 
            forceEmptyCart = false,
            mockLocalStorage = false
        } = options;

        // Prioridades de inicialización
        if (forceEmptyCart) return [];
        if (mockLocalStorage) return [];
        if (initialCart && Array.isArray(initialCart)) return initialCart;

        // Intentar recuperar del localStorage
        try {
            const storedCart = this.getStoredCart();
            return storedCart || [];
        } catch (error) {
            this.logger.error('Error al inicializar carrito:', error);
            return [];
        }
    }

    // Método seguro para obtener carrito de localStorage
    getStoredCart() {
        if (!this.isLocalStorageAvailable()) {
            this.logger.warn('localStorage no disponible');
            return null;
        }

        const cartData = localStorage.getItem('cart');
        if (!cartData) return null;

        try {
            const parsedCart = JSON.parse(cartData);
            return this.validateCart(parsedCart) ? parsedCart : null;
        } catch (error) {
            this.logger.error('Error al parsear carrito:', error);
            return null;
        }
    }

    // Validación de estructura de carrito
    validateCart(cart) {
        return Array.isArray(cart) && cart.every(item => 
            item && typeof item === 'object' &&
            'id' in item && 'title' in item &&
            'price' in item && 'quantity' in item &&
            Number.isInteger(item.quantity) && item.quantity > 0
        );
    }

    // Verificación de localStorage
    isLocalStorageAvailable() {
        try {
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
            localStorage.setItem('__test__', '1');
            localStorage.removeItem('__test__');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Método para añadir producto con validaciones
    addToCart(product, options = {}) {
        const { 
            notificationCallback = null,
            allowDuplicates = false
        } = options;

        // Validar producto
        if (!this.isValidProduct(product)) {
            this.logger.warn('Producto inválido');
            return false;
        }

        // Verificar límite de productos únicos
        if (!allowDuplicates && this.cart.length >= CartService.MAX_UNIQUE_PRODUCTS) {
            this.logger.warn(`Límite de ${CartService.MAX_UNIQUE_PRODUCTS} productos únicos alcanzado`);
            this.notifyUser(notificationCallback, `Máximo ${CartService.MAX_UNIQUE_PRODUCTS} productos únicos`, 'error');
            return false;
        }

        // Buscar producto existente
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            // Verificar límite de cantidad por producto
            if (existingItem.quantity >= CartService.MAX_PRODUCT_QUANTITY) {
                this.logger.warn(`Límite de ${CartService.MAX_PRODUCT_QUANTITY} unidades por producto alcanzado`);
                this.notifyUser(notificationCallback, `Máximo ${CartService.MAX_PRODUCT_QUANTITY} unidades por producto`, 'warning');
                return false;
            }
            existingItem.quantity = Math.min(existingItem.quantity + 1, CartService.MAX_PRODUCT_QUANTITY);
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.notifyObservers();
        return true;
    }

    // Método para actualizar cantidad
    updateQuantity(productId, quantity, options = {}) {
        const { 
            allowOverflow = false, 
            notificationCallback = null 
        } = options;

        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            this.logger.warn(`Producto con ID ${productId} no encontrado`);
            return false;
        }

        const newQuantity = Math.max(0, 
            allowOverflow ? quantity : Math.min(quantity, CartService.MAX_PRODUCT_QUANTITY)
        );
        
        if (newQuantity === 0) {
            this.cart.splice(itemIndex, 1);
        } else {
            this.cart[itemIndex].quantity = newQuantity;
        }

        this.saveCart();
        this.notifyObservers();
        return true;
    }

    // Método para eliminar producto
    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length < initialLength) {
            this.saveCart();
            this.notifyObservers();
            return true;
        }
        
        return false;
    }

    // Método para vaciar carrito
    emptyCart() {
        this.cart = [];
        this.saveCart();
        this.notifyObservers();
    }

    // Guardar carrito en localStorage
    saveCart() {
        try {
            if (!this.isLocalStorageAvailable()) {
                this.logger.warn('localStorage no disponible');
                return false;
            }

            localStorage.setItem('cart', JSON.stringify(this.cart));
            return true;
        } catch (error) {
            this.logger.error('Error al guardar carrito:', error);
            return false;
        }
    }

    // Métodos de observers
    registerObserver(observer) {
        if (typeof observer === 'function') {
            this.observers.push(observer);
        }
    }

    addObserver(observer) {
        this.registerObserver(observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => {
            try {
                observer(this.cart);
            } catch (error) {
                this.logger.error('Error al notificar observer:', error);
            }
        });
    }

    // Métodos auxiliares
    getCart() {
        return [...this.cart];  // Devolver copia para evitar mutación directa
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        // Contar productos únicos, no la cantidad total
        return new Set(this.cart.map(item => item.id)).size;
    }

    getTotalProductQuantity() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Validación de producto
    isValidProduct(product) {
        return product && 
            typeof product === 'object' &&
            'id' in product && 
            'title' in product && 
            'price' in product &&
            typeof product.id === 'number' &&
            typeof product.title === 'string' &&
            typeof product.price === 'number' &&
            product.price > 0;
    }

    // Notificación de usuario
    notifyUser(callback, message, type = 'info') {
        if (typeof callback === 'function') {
            callback(message, type);
        }
    }

    // Obtener carrito
    getCart() {
        return [...this.cart];
    }
}

export { CartService };
