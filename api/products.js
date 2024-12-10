// Constants
export const API_URL = 'https://fakestoreapi.com/products';
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300/cccccc/666666?text=Imagen+no+disponible';

import { cartUI } from '../js/cart-init.js';
import ProductDetailModal from '../js/ui/ProductDetailModal.js';

// Product Service
export const ProductService = {
    async fetchProducts() {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};

// DOM Helpers
export const DOMHelpers = {
    createElement({ tag, className, text, attributes = {} }) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }
};

// Product Card Component
export class ProductCard {
    constructor(product) {
        this.product = product;
        this.productDetailModal = null;
    }

    createImageContainer() {
        const imageContainer = DOMHelpers.createElement({
            tag: 'div',
            className: 'image-container'
        });

        const img = DOMHelpers.createElement({
            tag: 'img',
            className: 'product-image1',
            attributes: {
                src: this.product.image || PLACEHOLDER_IMAGE,
                alt: this.product.title
            }
        });

        img.onerror = () => {
            img.src = PLACEHOLDER_IMAGE;
        };

        // Añadir evento de click para abrir modal
        img.addEventListener('click', () => this.openProductDetailModal());

        imageContainer.appendChild(img);
        return imageContainer;
    }

    createAddToCartButton() {
        const addToCartButton = DOMHelpers.createElement({
            tag: 'button',
            className: 'btn-add-to-cart',
            text: 'Añadir al Carrito',
            attributes: {
                type: 'button'
            }
        });

        // Añadir evento al botón para añadir al carrito
        addToCartButton.addEventListener('click', () => {
            // Verificar que cartUI esté definido
            if (typeof cartUI !== 'undefined') {
                cartUI.addToCart({
                    ...this.product,
                    quantity: 1
                });
            } else {
                console.warn('CartUI no está inicializado');
            }
        });

        return addToCartButton;
    }

    // Método para inicializar y abrir el modal de producto
    openProductDetailModal() {
        // Crear modal solo una vez
        if (!this.productDetailModal) {
            this.productDetailModal = new ProductDetailModal(cartUI);
        }
        
        // Abrir modal con los datos del producto
        this.productDetailModal.openModal(this.product);
    }

    render() {
        const card = DOMHelpers.createElement({
            tag: 'div',
            className: 'card',
            attributes: {
                'data-product-id': this.product.id
            }
        });

        const imageContainer = this.createImageContainer();
        
        const title = DOMHelpers.createElement({
            tag: 'h3',
            text: this.product.title
        });

        const price = DOMHelpers.createElement({
            tag: 'p',
            text: `$${this.product.price.toFixed(2)}`
        });

        const addToCartButton = this.createAddToCartButton();

        card.appendChild(imageContainer);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(addToCartButton);

        return card;
    }
}

// Category Filter Component
export class CategoryFilter {
    constructor(categories, onFilterChange) {
        this.categories = categories;
        this.onFilterChange = onFilterChange;
        this.element = document.getElementById('categoryFilter');
    }

    render() {
        if (!this.element) return;

        const options = ['all', ...new Set(this.categories)];
        this.element.innerHTML = options.map(category =>
            `<option value="${category}">
                ${category === 'all' ? 'Todas las Categorías' : category}
            </option>`
        ).join('');

        this.element.addEventListener('change', () => {
            const selectedCategory = this.element.value;
            this.onFilterChange(selectedCategory);

            // Actualizar URL con parámetro de categoría
            const url = new URL(window.location);
            if (selectedCategory === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', selectedCategory);
            }
            window.history.pushState({}, '', url);
        });
    }
}

// Product Grid Controller
export class ProductGridController {
    constructor() {
        this.productGrid = document.querySelector('.product-grid');
        this.products = [];
    }

    displayProducts(products) {
        if (!this.productGrid) return;
        
        this.productGrid.innerHTML = '';
        products.forEach(product => {
            const card = new ProductCard(product);
            this.productGrid.appendChild(card.render());
        });
    }

    handleCategoryFilter(category) {
        const filteredProducts = category === 'all'
            ? this.products
            : this.products.filter(product => product.category.toLowerCase() === category.toLowerCase());
        this.displayProducts(filteredProducts);
    }

    async initialize() {
        const loadingModal = document.getElementById('loading-modal');
        const categoryFilter = document.getElementById('categoryFilter');
        
        try {
            // Mostrar modal de carga
            loadingModal.classList.add('show');
            
            const products = await ProductService.fetchProducts();
            this.products = products;
            
            // Configurar filtro de categorías
            const categories = ['all', ...new Set(products.map(p => p.category))];
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category === 'all' ? 'Todas las Categorías' : category;
                categoryFilter.appendChild(option);
            });

            // Configurar evento de filtro
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
            
            // Filtrar por categoría si existe en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            
            if (category) {
                categoryFilter.value = category;
                this.handleCategoryFilter(category);
            } else {
                this.displayProducts(products);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            // Opcional: mostrar mensaje de error al usuario
        } finally {
            // Ocultar modal de carga
            loadingModal.classList.remove('show');
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProductGridController();
    app.initialize();
});