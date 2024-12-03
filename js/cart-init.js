import { cartService } from './services/cart.js';
import CartUI from './ui/CartUI.js';

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CartUI(cartService);
});
