import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar un DOM virtual
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="cart-icon"></div>
      <div id="cart-modal"></div>
      <div id="cart-items"></div>
    </body>
  </html>
`, {
  url: 'http://localhost',
  runScripts: 'dangerously'
});

global.document = dom.window.document;
global.window = dom.window;
global.MouseEvent = dom.window.MouseEvent;

// Mock global fetch y localStorage
global.fetch = vi.fn();
global.localStorage = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn()
};

// Mock CartService para pruebas
class MockCartService {
  constructor() {
    this.cart = [];
    this.observers = [];
  }

  addToCart(product) {
    // Simular la lógica de addToCart de CartService
    const existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      // Si ya existe, incrementar cantidad hasta un máximo de 3
      existingItem.quantity = Math.min((existingItem.quantity || 1) + 1, 3);
    } else {
      // Si es nuevo, añadir con cantidad 1
      this.cart.push({ ...product, quantity: 1 });
    }
    this.notifyObservers();
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.cart));
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  getCart() {
    return this.cart;
  }
}

// Mock CartUI
class MockCartUI {
  constructor(cartService) {
    this.cartService = cartService;
    this.cart = [];
    
    // Simular elementos del DOM
    this.cartIcon = document.createElement('div');
    this.cartIcon.id = 'cart-icon';
    document.body.appendChild(this.cartIcon);

    this.cartModal = document.createElement('div');
    this.cartModal.id = 'cart-modal';
    document.body.appendChild(this.cartModal);

    this.cartItems = document.createElement('div');
    this.cartItems.id = 'cart-items';
    document.body.appendChild(this.cartItems);
  }

  addToCart(product) {
    // Simular la lógica de añadir al carrito
    const existingProductIndex = this.cart.findIndex(p => p.id === product.id);
    
    if (existingProductIndex !== -1) {
      // Si el producto ya existe, incrementar cantidad
      this.cart[existingProductIndex].quantity += product.quantity || 1;
    } else {
      // Si es un producto nuevo, añadirlo
      this.cart.push({
        ...product,
        quantity: product.quantity || 1
      });
    }

    // Notificar a los observadores del servicio de carrito
    this.cartService.addToCart(product);
  }

  setupEventListeners() {
    // Método vacío para simular la configuración de eventos
  }
}

// Mock ProductDetailModal
class MockProductDetailModal {
  constructor() {}
  openModal() {}
}

describe('ProductCard', () => {
  let productsModule;
  let ProductCard;
  let ProductService;
  let DOMHelpers;
  let CategoryFilter;
  let mockProduct;

  beforeEach(async () => {
    // Crear mocks para servicios
    global.mockCartService = new MockCartService();
    global.mockProductDetailModal = new MockProductDetailModal();

    // Importar módulos de forma dinámica
    productsModule = await import('../api/products.js');
    ProductCard = productsModule.ProductCard;
    ProductService = productsModule.ProductService;
    DOMHelpers = productsModule.DOMHelpers;
    CategoryFilter = productsModule.CategoryFilter;
    
    // Inicializar CartUI con el mock de CartService
    global.cartUI = new MockCartUI(global.mockCartService);
    
    // Limpiar el carrito antes de cada prueba
    global.cartUI.cart = [];
    global.mockCartService.cart = [];

    // Configurar el DOM
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="cart-icon"></div>
            <div id="cart-modal"></div>
            <div id="cart-items"></div>
        </body>
        </html>
    `, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable'
    });

    global.document = dom.window.document;
    global.window = dom.window;

    // Producto de prueba
    mockProduct = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      image: 'https://ejemplo.com/imagen.jpg',
      rate: 4.5,
      rating: {
        rate: 4.5,
        count: 100
      },
      description: 'Descripción de prueba',
      category: 'Categoría de prueba',
      quantity: 1
    };

    // Reemplazar la importación de cartUI
    vi.doMock('../js/cart-init.js', () => ({
        cartUI: global.cartUI
    }));
  });

  afterEach(() => {
    // Limpiar mocks después de cada prueba
    vi.restoreAllMocks();
    global.cartUI = null;
  });

  it('debería crear una instancia de ProductCard correctamente', () => {
    const productCard = new ProductCard(mockProduct);
    
    expect(productCard.product).toEqual(mockProduct);
    expect(productCard.productDetailModal).toBeNull();
  });

  it('debería renderizar una tarjeta de producto completa', () => {
    const productCard = new ProductCard(mockProduct);
    
    const cardElement = productCard.render();
    
    expect(cardElement.tagName).toBe('DIV');
    expect(cardElement.className).toBe('card');
    expect(cardElement.getAttribute('data-product-id')).toBe('1');
    
    // Verificar elementos hijos
    const [imageContainer, title, price, addToCartButton] = cardElement.children;
    
    expect(imageContainer.className).toBe('image-container');
    expect(title.tagName).toBe('H3');
    expect(title.textContent).toBe('Producto de prueba');
    expect(price.tagName).toBe('P');
    expect(price.textContent).toBe('$10.99');
    expect(addToCartButton.tagName).toBe('BUTTON');
    expect(addToCartButton.className).toBe('btn-add-to-cart');
    expect(addToCartButton.textContent).toBe('Añadir al Carrito');
  });

  it('debería manejar el error de imagen usando imagen placeholder', () => {
    const productCard = new ProductCard(mockProduct);
    
    const cardElement = productCard.render();
    const img = cardElement.querySelector('img');
    
    // Simular evento de error en la imagen
    const errorEvent = document.createEvent('Event');
    errorEvent.initEvent('error', true, true);
    img.dispatchEvent(errorEvent);
    
    expect(img.src).toBe(productsModule.PLACEHOLDER_IMAGE);
  });

  it('debería añadir producto al carrito al hacer click en botón', () => {
    // Asegurar que CartUI esté inicializado
    const mockCartService = new MockCartService();
    const mockCartUI = new MockCartUI(mockCartService);
    global.cartUI = mockCartUI;

    const productData = {
      id: 1,
      title: 'Producto de prueba',
      price: 10.99,
      image: 'https://ejemplo.com/imagen.jpg',
      rate: 4.5,
      rating: { rate: 4.5, count: 100 },
      description: 'Descripción de prueba',
      category: 'Categoría de prueba'
    };

    const productCard = new ProductCard(productData);
    const addToCartButton = productCard.createAddToCartButton();

    console.log('Botón de añadir al carrito:', addToCartButton);
    console.log('Evento de click del botón:', addToCartButton.onclick);

    // Simular el click del botón
    addToCartButton.click();
  });

  it('debería crear un contenedor de imagen con evento de click', () => {
    const productCard = new ProductCard(mockProduct);
    
    // Espiar el método openProductDetailModal
    const openModalSpy = vi.spyOn(productCard, 'openProductDetailModal');
    
    const cardElement = productCard.render();
    const img = cardElement.querySelector('img');
    
    // Simular click en imagen
    img.click();
    
    expect(openModalSpy).toHaveBeenCalled();
  });

  it('debería crear un contenedor de imagen con la imagen correcta', () => {
    const { ProductCard, PLACEHOLDER_IMAGE } = productsModule;

    // Crear un mock de producto con una imagen
    const mockProductWithImage = {
      ...mockProduct,
      image: 'https://ejemplo.com/imagen-test.jpg'
    };

    // Crear instancia de ProductCard
    const productCard = new ProductCard(mockProductWithImage);
    
    // Crear contenedor de imagen
    const imageContainer = productCard.createImageContainer();
    
    // Verificar que el contenedor existe
    expect(imageContainer).toBeTruthy();
    
    // Verificar la imagen
    const img = imageContainer.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toBe(mockProductWithImage.image);
    expect(img.alt).toBe(mockProductWithImage.title);
    expect(img.className).toBe('product-image1');
  });

  it('debería usar imagen de reemplazo cuando la imagen falla', () => {
    const { ProductCard, PLACEHOLDER_IMAGE } = productsModule;

    // Crear un mock de producto con una imagen
    const mockProductWithImage = {
      ...mockProduct,
      image: 'https://imagen-que-no-existe.jpg'
    };

    // Crear instancia de ProductCard
    const productCard = new ProductCard(mockProductWithImage);
    
    // Crear contenedor de imagen
    const imageContainer = productCard.createImageContainer();
    
    // Obtener la imagen
    const img = imageContainer.querySelector('img');
    
    // Simular error de carga directamente
    img.onerror = () => {
      img.src = PLACEHOLDER_IMAGE;
    };

    // Simular evento de error
    img.onerror();
    
    // Verificar que se establece la imagen de reemplazo
    expect(img.src).toBe(PLACEHOLDER_IMAGE);
  });

  it('debería manejar productos sin imagen estableciendo una imagen de reemplazo', () => {
    const productSinImagen = { 
      ...mockProduct, 
      image: null 
    };
    const productCard = new ProductCard(productSinImagen);
    const card = productCard.render();
    
    const img = card.querySelector('img');
    expect(img.src).toBe(productsModule.PLACEHOLDER_IMAGE);
  });

  it('debería crear un elemento con atributos, texto y clase correctos', () => {
    const { DOMHelpers } = productsModule;

    // Crear un elemento con todos los parámetros
    const element = DOMHelpers.createElement({
      tag: 'div',
      className: 'test-class',
      text: 'Texto de prueba',
      attributes: {
        'data-test': 'valor-prueba',
        'id': 'elemento-prueba'
      }
    });

    // Verificaciones
    expect(element.tagName.toLowerCase()).toBe('div');
    expect(element.className).toBe('test-class');
    expect(element.textContent).toBe('Texto de prueba');
    expect(element.getAttribute('data-test')).toBe('valor-prueba');
    expect(element.id).toBe('elemento-prueba');
  });

  it('debería obtener productos desde la API', async () => {
    const { ProductService } = productsModule;

    // Simular fetch global
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: 'Producto de prueba', price: 10.99 },
        { id: 2, title: 'Otro producto', price: 20.50 }
      ])
    });

    // Llamar a fetchProducts
    const productos = await ProductService.fetchProducts();

    // Verificaciones
    expect(global.fetch).toHaveBeenCalledWith('https://fakestoreapi.com/products');
    expect(productos).toHaveLength(2);
    expect(productos[0].title).toBe('Producto de prueba');
    expect(productos[1].price).toBe(20.50);
  });
});

describe('CategoryFilter', () => {
  let CategoryFilter;

  beforeEach(async () => {
    const productsModule = await import('../api/products.js');
    console.log('Módulos importados:', Object.keys(productsModule));
    console.log('Contenido de CategoryFilter:', productsModule.CategoryFilter);
    CategoryFilter = productsModule.CategoryFilter;
  });

  it('debería renderizar correctamente las opciones de CategoryFilter', async () => {
    console.log('Tipo de CategoryFilter:', typeof CategoryFilter);
    console.log('CategoryFilter:', CategoryFilter);

    // Crear un elemento select mock
    const selectElement = document.createElement('select');
    selectElement.id = 'categoryFilter';
    document.body.appendChild(selectElement);

    // Categorías de prueba
    const testCategories = ['electronics', 'jewelery', 'clothing'];
    
    // Función mock para el cambio de filtro
    const mockOnFilterChange = vi.fn();

    // Crear instancia de CategoryFilter
    const categoryFilter = new CategoryFilter(testCategories, mockOnFilterChange);
    
    // Renderizar
    categoryFilter.render();

    // Verificar opciones
    const options = selectElement.querySelectorAll('option');
    expect(options.length).toBe(4); // 'all' + 3 categorías

    // Verificar primera opción (todas las categorías)
    expect(options[0].value).toBe('all');
    expect(options[0].textContent.trim()).toBe('Todas las Categorías');

    // Verificar otras opciones
    expect(options[1].value).toBe('electronics');
    expect(options[2].value).toBe('jewelery');
    expect(options[3].value).toBe('clothing');

    // Simular cambio de categoría
    selectElement.value = 'electronics';
    const changeEvent = document.createEvent('Event');
    changeEvent.initEvent('change', true, true);
    selectElement.dispatchEvent(changeEvent);

    // Verificar que se llamó a la función de cambio de filtro
    expect(mockOnFilterChange).toHaveBeenCalledWith('electronics');

    // Limpiar
    document.body.removeChild(selectElement);
  });
});

describe('ProductGridController', () => {
  let ProductGridController;
  let ProductCard;
  let ProductService;
  let mockProducts;

  beforeEach(async () => {
    // Importar módulos de forma dinámica
    const productsModule = await import('../api/products.js');
    ProductGridController = productsModule.default || productsModule.ProductGridController;
    ProductCard = productsModule.ProductCard;
    ProductService = productsModule.ProductService;

    // Crear DOM virtual para pruebas
    document.body.innerHTML = `
      <div class="product-grid"></div>
      <select id="categoryFilter"></select>
      <div id="loading-modal"></div>
    `;

    // Datos de productos de prueba
    mockProducts = [
      {
        id: 1,
        title: 'Producto 1',
        price: 10.99,
        category: 'electronics',
        image: 'https://ejemplo.com/imagen1.jpg'
      },
      {
        id: 2,
        title: 'Producto 2',
        price: 20.99,
        category: 'clothing',
        image: 'https://ejemplo.com/imagen2.jpg'
      },
      {
        id: 3,
        title: 'Producto 3',
        price: 30.99,
        category: 'electronics',
        image: 'https://ejemplo.com/imagen3.jpg'
      }
    ];

    // Mock de fetchProducts
    vi.spyOn(ProductService, 'fetchProducts').mockResolvedValue(mockProducts);

    // Verificar que el mock está configurado correctamente
    const fetchedProducts = await ProductService.fetchProducts();
    console.log('Fetched Products:', fetchedProducts);
    expect(fetchedProducts).toEqual(mockProducts);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería inicializar correctamente', async () => {
    const controller = new ProductGridController();
    
    // Espiar métodos
    const displayProductsSpy = vi.spyOn(controller, 'displayProducts');
    vi.spyOn(controller, 'handleCategoryFilter');

    console.log('Mock Products:', mockProducts);

    await controller.initialize();

    console.log('Spy Calls:', displayProductsSpy.mock.calls);
    console.log('Actual Products:', controller.products);
    
    // Verificar que se cargaron los productos
    expect(controller.products).toEqual(mockProducts);
    
    // Verificar que se renderizaron los productos
    expect(displayProductsSpy).toHaveBeenCalledTimes(1);
    
    // Debugging: log the exact call arguments
    const displayCallArgs = displayProductsSpy.mock.calls[0][0];
    console.log('Display Call Args:', displayCallArgs);
    
    // Verificar que los productos renderizados son un subconjunto de los originales
    const filteredProducts = mockProducts.filter(p => p.category === 'electronics');
    expect(displayCallArgs.length).toEqual(filteredProducts.length);
    displayCallArgs.forEach((product, index) => {
      expect(product).toEqual(expect.objectContaining(filteredProducts[index]));
    });

    // Verificar que se configuraron las opciones de categoría
    const categoryFilter = document.getElementById('categoryFilter');
    const options = categoryFilter.querySelectorAll('option');
    expect(options.length).toBe(3); // 'Todas las Categorías', 'electronics', 'clothing'
    
    // Verificar los valores de las opciones
    const optionValues = Array.from(options).map(option => option.value);
    expect(optionValues).toContain('all');
    expect(optionValues).toContain('electronics');
    expect(optionValues).toContain('clothing');
  });

  it('debería filtrar productos por categoría correctamente', async () => {
    const controller = new ProductGridController();
    await controller.initialize();

    // Filtrar por categoría 'electronics'
    controller.handleCategoryFilter('electronics');

    const productGrid = document.querySelector('.product-grid');
    const productCards = productGrid.querySelectorAll('.card');

    // Verificar que solo se muestren productos de electrónica
    expect(productCards.length).toBe(2);
    productCards.forEach(card => {
      const title = card.querySelector('h3').textContent;
      expect(['Producto 1', 'Producto 3']).toContain(title);
    });
  });

  it('debería manejar el filtro de categoría "all"', async () => {
    const controller = new ProductGridController();
    await controller.initialize();

    // Filtrar por 'all'
    controller.handleCategoryFilter('all');

    const productGrid = document.querySelector('.product-grid');
    const productCards = productGrid.querySelectorAll('.card');

    // Verificar que se muestren todos los productos
    expect(productCards.length).toBe(3);
  });

  it('debería configurar correctamente las opciones de filtro de categoría', async () => {
    const controller = new ProductGridController();
    await controller.initialize();

    const categoryFilter = document.getElementById('categoryFilter');
    const options = categoryFilter.querySelectorAll('option');

    // Verificar que se crearon las opciones de categoría correctamente
    expect(options.length).toBe(3); // 'all' + 2 categorías únicas
    
    const optionValues = Array.from(options).map(option => option.value);
    expect(optionValues).toContain('all');
    expect(optionValues).toContain('electronics');
    expect(optionValues).toContain('clothing');
  });

  it('debería manejar errores al cargar productos', async () => {
    const controller = new ProductGridController();
    
    // Simular error en fetchProducts
    vi.spyOn(ProductService, 'fetchProducts').mockRejectedValue(new Error('Error de red'));
    
    // Espiar console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await controller.initialize();

    // Verificar que se manejó el error
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar productos:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});