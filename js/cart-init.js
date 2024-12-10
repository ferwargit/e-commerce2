import { cartService } from './services/cart.js';
import CartUI from './ui/CartUI.js';

// Inicializar el carrito cuando el DOM esté listo
let cartUI;

document.addEventListener('DOMContentLoaded', () => {
    cartUI = new CartUI(cartService);
});

// Exportar la instancia de CartUI
export { cartUI };
