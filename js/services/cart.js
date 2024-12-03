class CartService {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.observers = [];
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
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
            item.quantity = Math.max(0, quantity);
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
}

export const cartService = new CartService();
