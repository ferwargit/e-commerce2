import { cartService } from './services/cart.js';
import CartUI from './ui/CartUI.js';

// Inicializar el carrito cuando el DOM esté listo
let cartUI;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando CartUI');
    // Crear instancia de CartUI
    cartUI = new CartUI(cartService);
    
    // Exportar globalmente para acceder desde otros scripts si es necesario
    window.cartUI = cartUI;
    
    console.log('CartUI inicializado:', cartUI);
});

// Exportar la instancia de CartUI
export { cartUI };
