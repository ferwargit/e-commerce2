import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CartService } from '../js/services/cart.js';
import CartUI from '../js/ui/CartUI.js';
import ProductDetailModal from '../js/ui/ProductDetailModal.js';

describe('cart-init.js', () => {
    let originalAddEventListener;
    let cartService;
    let cartInitModule;

    beforeEach(async () => {
        // Guardar el método original
        originalAddEventListener = document.addEventListener;
        
        // Crear una instancia de CartService
        cartService = new CartService();

        // Limpiar mocks globales
        delete window.cartUI;
        delete window.productDetailModal;

        // Importar el módulo
        cartInitModule = await import('../js/cart-init.js');
    });

    afterEach(() => {
        // Restaurar el método original
        document.addEventListener = originalAddEventListener;
    });

    it('debe exportar cartService', () => {
        expect(cartInitModule.cartService).toBeTruthy();
        expect(cartInitModule.cartService).toBeInstanceOf(CartService);
    });

    it('debe configurar las instancias globales correctamente', () => {
        // Crear mocks para las instancias
        const mockCartService = new CartService();
        const mockCartUI = new CartUI(mockCartService);
        const mockProductDetailModal = new ProductDetailModal(mockCartService);

        // Simular la creación de instancias
        vi.spyOn(CartUI.prototype, 'constructor').mockReturnValue(mockCartUI);
        vi.spyOn(ProductDetailModal.prototype, 'constructor').mockReturnValue(mockProductDetailModal);

        // Simular el evento DOMContentLoaded
        const domLoadedEvent = new Event('DOMContentLoaded');
        document.dispatchEvent(domLoadedEvent);

        // Verificar que se crearon las instancias globales
        expect(window.cartUI).toBeTruthy();
        expect(window.productDetailModal).toBeTruthy();
    });
});
