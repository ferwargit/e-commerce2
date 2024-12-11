class ProductDetailModal {
    constructor(cartService) {
        this.cartService = cartService;
        this.modalContainer = null;
        this.currentProduct = null;
        this.initModal();
    }

    initModal() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.classList.add('product-detail-modal');
        this.modalContainer.innerHTML = `
            <div class="product-detail-content box">
                <button class="close-detail-modal">
                    <i class="ri-close-line"></i>
                </button>
                <div class="product-modal-grid">
                    <div class="box-img product-modal-image">
                        <img src="" alt="Product Image">
                    </div>
                    <div class="product-modal-info">
                        <h3 class="product-modal-title"></h3>
                        <div class="product-modal-rating">
                            <div class="stars"></div>
                            <span class="review-count"></span>
                        </div>
                        <div class="inbox">
                            <h4 class="product-modal-price price"></h4>
                        </div>
                        <div class="product-modal-description-container">
                            <h4>Descripción</h4>
                            <p class="product-modal-description"></p>
                        </div>
                        <div class="product-modal-category">
                            <h4>Categoría</h4>
                            <p class="category-text"></p>
                        </div>
                        <div class="product-modal-actions">
                            <button class="btn-add-to-cart">Añadir al Carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modalContainer);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = this.modalContainer.querySelector('.close-detail-modal');
        closeBtn.addEventListener('click', () => this.closeModal());

        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Añadir evento al botón de añadir al carrito
        const addToCartBtn = this.modalContainer.querySelector('.btn-add-to-cart');
        addToCartBtn.addEventListener('click', () => {
            if (this.currentProduct) {
                this.addToCart(this.currentProduct);
            }
        });
    }

    openModal(product) {
        const modalImage = this.modalContainer.querySelector('.product-modal-image img');
        const modalTitle = this.modalContainer.querySelector('.product-modal-title');
        const modalPrice = this.modalContainer.querySelector('.product-modal-price');
        const modalDescription = this.modalContainer.querySelector('.product-modal-description');
        const modalCategory = this.modalContainer.querySelector('.category-text');
        const modalStars = this.modalContainer.querySelector('.stars');
        const modalReviewCount = this.modalContainer.querySelector('.review-count');

        // Guardar el producto actual para usar en addToCart
        this.currentProduct = product;

        modalImage.src = product.image;
        modalTitle.textContent = product.title;
        modalPrice.textContent = `$${product.price.toFixed(2)}`;
        modalDescription.textContent = product.description;
        modalCategory.textContent = product.category;
        
        // Generar estrellas
        modalStars.innerHTML = this.generateStarRating(product.rating.rate);
        modalReviewCount.textContent = `(${product.rating.count} reseñas)`;

        // Añadir clase show para mostrar el modal
        this.modalContainer.classList.add('show');
    }

    closeModal() {
        // Remover clase show para ocultar el modal
        this.modalContainer.classList.remove('show');
    }

    addToCart(product) {
        console.log('Añadiendo producto al carrito:', product);
        console.log('CartService:', this.cartService);
        console.log('window.cartUI:', window.cartUI);

        if (this.cartService) {
            const added = this.cartService.addToCart({
                ...product,
                quantity: 1
            }, {
                // Usar la notificación del servicio de carrito
                notificationCallback: (message, type) => {
                    if (window.cartUI) {
                        window.cartUI.showCartNotification(message, type);
                    }
                }
            });

            console.log('Producto añadido:', added);

            // Mostrar notificación si el producto se añadió correctamente
            if (added && window.cartUI) {
                window.cartUI.showCartNotification(`${product.title} añadido al carrito`, 'success');
            } else {
                console.warn('No se pudo añadir el producto o no hay notificación disponible');
            }
        } else {
            console.warn('CartService no está inicializado');
        }
    }

    generateStarRating(rating) {
        // Normalizar el rating entre 0 y 5
        const normalizedRating = Math.max(0, Math.min(5, rating));
        
        const fullStars = Math.floor(normalizedRating);
        const halfStar = normalizedRating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="ri-star-fill"></i>';
        }
        if (halfStar) {
            starsHTML += '<i class="ri-star-half-line"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="ri-star-line"></i>';
        }

        return starsHTML;
    }
}

export default ProductDetailModal;
