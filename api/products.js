// Constants
const API_URL = 'https://fakestoreapi.com/products';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300/cccccc/666666?text=Imagen+no+disponible';

import { cartUI } from '../js/cart-init.js';

// Product Service
const ProductService = {
    async fetchProducts() {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};

// DOM Helpers
const DOMHelpers = {
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
class ProductCard {
    constructor(product) {
        this.product = product;
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
                src: this.product.image,
                alt: this.product.title
            }
        });

        img.onerror = () => {
            img.src = PLACEHOLDER_IMAGE;
        };

        imageContainer.appendChild(img);
        return imageContainer;
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

        const addToCartButton = DOMHelpers.createElement({
            tag: 'button',
            className: 'btn-add-to-cart',
            text: 'Añadir al Carrito',
            attributes: {
                'data-id': this.product.id.toString()
            }
        });

        // Agregar la funcionalidad del carrito al botón existente
        addToCartButton.addEventListener('click', () => {
            if (cartUI) {
                cartUI.addToCart(this.product);
            } else {
                console.error('CartUI no está inicializado');
            }
        });

        card.appendChild(imageContainer);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(addToCartButton);

        return card;
    }
}

// Category Filter Component
class CategoryFilter {
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
class ProductGridController {
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
        try {
            this.products = await ProductService.fetchProducts();
            
            // Obtener categoría de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const initialCategory = urlParams.get('category');

            // Configurar filtro de categorías
            const categoryFilter = new CategoryFilter(
                this.products.map(p => p.category),
                category => this.handleCategoryFilter(category)
            );
            categoryFilter.render();

            // Si hay una categoría inicial, aplicar filtro
            if (initialCategory) {
                const categorySelect = document.getElementById('categoryFilter');
                if (categorySelect) {
                    // Encontrar opción que coincida exactamente (case-insensitive)
                    const matchingOption = Array.from(categorySelect.options).find(
                        option => option.value.toLowerCase() === initialCategory.toLowerCase()
                    );

                    if (matchingOption) {
                        categorySelect.value = matchingOption.value;
                        this.handleCategoryFilter(matchingOption.value);
                    }
                }
            } else {
                // Si no hay categoría inicial, mostrar todos los productos
                this.displayProducts(this.products);
            }

        } catch (error) {
            console.error("Error:", error);
            if (this.productGrid) {
                this.productGrid.innerHTML = '<div class="error-message">Error al cargar los productos</div>';
            }
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProductGridController();
    app.initialize();
});