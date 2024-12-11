import { CartService } from './services/cart.js';
import CartUI from './ui/CartUI.js';
import ProductDetailModal from './ui/ProductDetailModal.js';

console.log('Iniciando cart-init.js');

// Crear instancia de CartService
const cartService = new CartService();
console.log('CartService creado:', cartService);

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Inicializando CartUI y ProductDetailModal');
    
    try {
        // Crear instancia de CartUI
        const cartUI = new CartUI(cartService);
        console.log('CartUI inicializado:', cartUI);
        
        // Crear instancia de ProductDetailModal
        const productDetailModal = new ProductDetailModal(cartService);
        console.log('ProductDetailModal inicializado:', productDetailModal);
        
        // Exportar globalmente para acceder desde otros scripts
        window.cartUI = cartUI;
        window.productDetailModal = productDetailModal;
        
        console.log('CartUI inicializado:', cartUI);
        console.log('ProductDetailModal inicializado:', productDetailModal);
    } catch (error) {
        console.error('Error al inicializar componentes del carrito:', error);
    }
});

// Exportar las instancias
export { cartService };
