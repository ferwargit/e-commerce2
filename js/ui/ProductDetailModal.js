class ProductDetailModal {
    constructor(cartUI) {
        this.cartUI = cartUI;
        this.modalContainer = null;
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
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modalContainer);
        this.setupEventListeners();
        this.setupTouchGestures();
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
    }

    setupTouchGestures() {
        let startY;
        const modal = this.modalContainer;
        const content = modal.querySelector('.product-detail-content');
        const grid = modal.querySelector('.product-modal-grid');

        content.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        content.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // Solo cerrar si está en la parte superior del scroll y se desliza hacia abajo
            if (deltaY > 50 && grid.scrollTop === 0) {  
                this.closeModal();
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

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
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
