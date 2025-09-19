// ===== PROTECCIÓN CONTRA CARGA MÚLTIPLE =====
if (window.NegocioVecinoAppLoaded) {
    console.warn('⚠️ Negocio Vecino ya está cargado, evitando duplicación');
} else {
    window.NegocioVecinoAppLoaded = true;

// ===== CONFIGURACIÓN Y DATOS AVANZADOS =====
window.NegocioVecinoConfig = window.NegocioVecinoConfig || {
    version: '2.1.0',
    animationDuration: 300,
    toastDuration: 4000,
    searchDelay: 300,
    maxImageSize: 2 * 1024 * 1024, // 2MB
    discountCodes: {
        'VECINO10': 0.1,
        'PRIMERA': 0.15,
        'FAMILIA': 0.05
    }
};

// ===== VARIABLES GLOBALES PARA NEGOCIO SELECCIONADO =====
let negocioActual = null;

// ===== NUEVA ESTRUCTURA DE DATOS CON SISTEMA DE SLIDER =====
let productos = [
    {
        id: 1,
        nombre: "Pan Integral Artesanal",
        descripcion: "Pan casero integral recién horneado con semillas de girasol y lino",
        categoria: "panaderia",
        destacado: true,
        activo: true,
        imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23d4a574' width='100' height='100'/%3E%3Ctext y='50' x='50' text-anchor='middle' dy='.3em' font-size='40'%3E🍞%3C/text%3E%3C/svg%3E",
        // NUEVO SISTEMA
        precioUnidad: 500, // Precio por 100g
        unidadMedida: "100g",
        cantidadMinima: 2, // Mínimo 200g
        cantidadMaxima: 20, // Máximo 2kg 
        stockTotal: 50, // Stock total en unidades
        incremento: 1 // Se puede incrementar de 1 en 1
    },
    {
        id: 2,
        nombre: "Leche Fresca Premium",
        descripcion: "Leche fresca del día de vacas locales, pasteurizada",
        categoria: "lacteos",
        destacado: false,
        activo: true,
        imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ffffff' width='100' height='100'/%3E%3Ctext y='50' x='50' text-anchor='middle' dy='.3em' font-size='40'%3E🥛%3C/text%3E%3C/svg%3E",
        precioUnidad: 380, // Precio por 250ml
        unidadMedida: "250ml",
        cantidadMinima: 2, // Mínimo 500ml
        cantidadMaxima: 16, // Máximo 4L
        stockTotal: 45,
        incremento: 1
    },
    {
        id: 3,
        nombre: "Huevos de Campo Orgánicos",
        descripcion: "Huevos frescos de gallinas libres criadas en campo abierto",
        categoria: "otros",
        destacado: true,
        activo: true,
        imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ffeaa7' width='100' height='100'/%3E%3Ctext y='50' x='50' text-anchor='middle' dy='.3em' font-size='40'%3E🥚%3C/text%3E%3C/svg%3E",
        precioUnidad: 267, // Precio por huevo
        unidadMedida: "unidad",
        cantidadMinima: 3, // Mínimo 3 huevos
        cantidadMaxima: 50, // Máximo 50 huevos
        stockTotal: 120,
        incremento: 1
    },
    {
        id: 4,
        nombre: "Tomates Cherry Orgánicos",
        descripcion: "Tomates cherry rojos y dulces, cultivados sin pesticidas",
        categoria: "verduras",
        destacado: false,
        activo: true,
        imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e17055' width='100' height='100'/%3E%3Ctext y='50' x='50' text-anchor='middle' dy='.3em' font-size='40'%3E🍅%3C/text%3E%3C/svg%3E",
        precioUnidad: 280, // Precio por 50g
        unidadMedida: "50g",
        cantidadMinima: 5, // Mínimo 250g
        cantidadMaxima: 40, // Máximo 2kg
        stockTotal: 80,
        incremento: 1
    },
    {
        id: 5,
        nombre: "Queso Artesanal de Cabra",
        descripcion: "Queso cremoso elaborado artesanalmente con leche de cabra",
        categoria: "lacteos",
        destacado: true,
        activo: true,
        imagen: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f1c40f' width='100' height='100'/%3E%3Ctext y='50' x='50' text-anchor='middle' dy='.3em' font-size='40'%3E🧀%3C/text%3E%3C/svg%3E",
        precioUnidad: 920, // Precio por 50g
        unidadMedida: "50g",
        cantidadMinima: 2, // Mínimo 100g
        cantidadMaxima: 20, // Máximo 1kg
        stockTotal: 30,
        incremento: 1
    }
];

// Estados de la aplicación
let carrito = [];
let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
let pedidos = [];
let currentTheme = localStorage.getItem('theme') || 'light';
let currentView = 'grid';
let currentCategory = 'all';
let currentSort = 'nombre';
let searchTerm = '';
let currentTab = 'resumen';
let currentEditingProduct = null;
let descuentoAplicado = 0;
let codigoDescuentoActual = '';

// Contadores e IDs
let productoIdCounter = 6;
let pedidoIdCounter = 1;

// Timers y estados
let searchTimer = null;
let loadingState = false;

// ===== ELEMENTOS DEL DOM =====
const clienteBtn = document.getElementById('clienteBtn');
const negocioBtn = document.getElementById('negocioBtn');
const themeToggle = document.getElementById('themeToggle');
const clienteInterface = document.getElementById('clienteInterface');
const negocioInterface = document.getElementById('negocioInterface');

const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const sortSelect = document.getElementById('sortSelect');
const gridView = document.getElementById('gridView');
const listView = document.getElementById('listView');
const productosGrid = document.getElementById('productosGrid');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const noResultsMessage = document.getElementById('noResultsMessage');
const favoritosSection = document.getElementById('favoritosSection');
const favoritosGrid = document.getElementById('favoritosGrid');

const carritoFlotante = document.getElementById('carritoFlotante');
const carritoItems = document.getElementById('carritoItems');
const carritoCount = document.getElementById('carritoCount');
const totalAmount = document.getElementById('totalAmount');
const subtotalAmount = document.getElementById('subtotalAmount');
const toggleCarrito = document.getElementById('toggleCarrito');
const clearCart = document.getElementById('clearCart');
const finalizarPedido = document.getElementById('finalizarPedido');

const productosAdmin = document.getElementById('productosAdmin');
const pedidosContainer = document.getElementById('pedidosContainer');
const currentDate = document.getElementById('currentDate');

const modalPedido = document.getElementById('modalPedido');
const modalProducto = document.getElementById('modalProducto');
const modalConfirmacion = document.getElementById('modalConfirmacion');
const loadingOverlay = document.getElementById('loadingOverlay');
const toastContainer = document.getElementById('toastContainer');

// ===== FUNCIONES AUXILIARES PARA SISTEMA DE SLIDER =====

// Obtener precio total por cantidad
function calcularPrecioTotal(producto, cantidad) {
    return producto.precioUnidad * cantidad;
}

// Verificar stock disponible
function verificarStock(producto, cantidad) {
    return cantidad <= producto.stockTotal;
}

// Formatear unidad de medida
function formatearUnidad(producto, cantidad) {
    const unidad = producto.unidadMedida;
    
    if (cantidad === 1) {
        return `${cantidad} ${unidad}`;
    }
    
    // Casos especiales para mostrar bien las unidades
    switch(unidad) {
        case 'unidad':
            return `${cantidad} unidades`;
        case '100g':
            return `${cantidad * 100}g`;
        case '250ml':
            return `${cantidad * 250}ml`;
        case '50g':
            return `${cantidad * 50}g`;
        default:
            return `${cantidad} ${unidad}`;
    }
}

// Obtener información de stock para mostrar
function getStockInfo(producto, cantidad) {
    const stockRestante = producto.stockTotal - cantidad;
    
    if (stockRestante <= 0) {
        return { 
            texto: 'Sin stock disponible', 
            clase: 'sin-stock',
            icon: '❌'
        };
    } else if (stockRestante <= 5) {
        return { 
            texto: `Quedan ${stockRestante} disponibles`, 
            clase: 'stock-warning',
            icon: '⚠️'
        };
    } else if (stockRestante <= 10) {
        return { 
            texto: `${stockRestante} disponibles`, 
            clase: 'stock-low',
            icon: '🔔'
        };
    }
    
    return { 
        texto: `${stockRestante} disponibles`, 
        clase: 'stock-ok',
        icon: '✅'
    };
}

// ===== FUNCIÓN PARA CARGAR INFORMACIÓN DEL NEGOCIO SELECCIONADO =====
function cargarNegocioSeleccionado() {
    console.log('🏪 Verificando si viene de selección de negocio...');
    
    let negocioInfo = null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');
    const storeName = urlParams.get('storeName');
    
    if (storeId && storeName) {
        negocioInfo = {
            id: parseInt(storeId),
            nombre: decodeURIComponent(storeName),
            categoria: urlParams.get('storeCategory') || 'general'
        };
        console.log('✅ Información encontrada en URL:', negocioInfo);
    }
    
    if (!negocioInfo) {
        try {
            const storedInfo = localStorage.getItem('negocioSeleccionado');
            if (storedInfo) {
                negocioInfo = JSON.parse(storedInfo);
                console.log('✅ Información encontrada en localStorage:', negocioInfo);
            }
        } catch (error) {
            console.warn('⚠️ Error leyendo localStorage:', error);
        }
    }
    
    if (negocioInfo && negocioInfo.nombre) {
        negocioActual = negocioInfo;
        personalizarInterfaz(negocioInfo);
        
        if (urlParams.has('storeId')) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
        
        return true;
    } else {
        console.log('ℹ️ No se encontró información de negocio específico, usando interfaz genérica');
        return false;
    }
}

function personalizarInterfaz(negocioInfo) {
    console.log(`🎨 Personalizando interfaz para: ${negocioInfo.nombre}`);
    
    const welcomeTitle = document.querySelector('.welcome-section h2');
    if (welcomeTitle) {
        welcomeTitle.innerHTML = `¡Bienvenido a <strong>${negocioInfo.nombre}</strong>!`;
    }
    
    const welcomeSubtitle = document.querySelector('.welcome-section p');
    if (welcomeSubtitle && negocioInfo.descripcion) {
        welcomeSubtitle.textContent = negocioInfo.descripcion;
    } else if (welcomeSubtitle) {
        welcomeSubtitle.textContent = 'Selecciona tus productos favoritos y arma tu pedido';
    }
    
    document.title = `${negocioInfo.nombre} - Negocio Vecino`;
    
    actualizarInfoCarritoNegocio(negocioInfo);
    
    if (negocioInfo.direccion || negocioInfo.telefono || negocioInfo.horario) {
        mostrarInfoAdicionalNegocio(negocioInfo);
    }
    
    aplicarTemaCategoria(negocioInfo.categoria);
    
    setTimeout(() => {
        showToast(`Conectado con ${negocioInfo.nombre}`, 'success');
    }, 1000);
    
    console.log('✅ Interfaz personalizada completamente');
}

function actualizarInfoCarritoNegocio(negocioInfo) {
    const carritoHeader = document.querySelector('.carrito-title span');
    if (carritoHeader) {
        carritoHeader.textContent = `Pedido - ${negocioInfo.nombre}`;
    }
}

function mostrarInfoAdicionalNegocio(negocioInfo) {
    let infoContainer = document.querySelector('.negocio-info-adicional');
    
    if (!infoContainer) {
        infoContainer = document.createElement('div');
        infoContainer.className = 'negocio-info-adicional';
        infoContainer.style.cssText = `
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            padding: var(--spacing-lg);
            margin: var(--spacing-lg) 0;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        `;
        
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection && welcomeSection.parentNode) {
            welcomeSection.parentNode.insertBefore(infoContainer, welcomeSection.nextSibling);
        }
    }
    
    let infoHtml = `
        <div class="negocio-details">
            <h3 style="margin-bottom: var(--spacing-md); color: var(--primary-color);">
                <i class="fas fa-info-circle"></i> 
                Información del Negocio
            </h3>
            <div class="negocio-details-grid" style="display: grid; gap: var(--spacing-sm);">
    `;
    
    if (negocioInfo.direccion) {
        infoHtml += `
            <div class="detail-item" style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <i class="fas fa-map-marker-alt" style="color: var(--primary-color); width: 16px;"></i>
                <span>${negocioInfo.direccion}</span>
            </div>
        `;
    }
    
    if (negocioInfo.telefono) {
        infoHtml += `
            <div class="detail-item" style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <i class="fas fa-phone" style="color: var(--primary-color); width: 16px;"></i>
                <span>${negocioInfo.telefono}</span>
            </div>
        `;
    }
    
    if (negocioInfo.horario) {
        infoHtml += `
            <div class="detail-item" style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <i class="fas fa-clock" style="color: var(--primary-color); width: 16px;"></i>
                <span>${negocioInfo.horario}</span>
            </div>
        `;
    }
    
    infoHtml += `
            </div>
        </div>
    `;
    
    infoContainer.innerHTML = infoHtml;
}

function aplicarTemaCategoria(categoria) {
    const root = document.documentElement;
    
    const temasCategoria = {
        'panaderia': {
            primary: '#d4a574',
            accent: '#e6bc8a'
        },
        'supermercado': {
            primary: '#4a90e2',
            accent: '#5ba0f2'
        },
        'farmacia': {
            primary: '#2ecc71',
            accent: '#3dd881'
        },
        'verduleria': {
            primary: '#27ae60',
            accent: '#2dc36a'
        },
        'carniceria': {
            primary: '#e74c3c',
            accent: '#f1685c'
        }
    };
    
    if (temasCategoria[categoria]) {
        const tema = temasCategoria[categoria];
        root.style.setProperty('--primary-color', tema.primary);
        root.style.setProperty('--primary-light', tema.accent);
        console.log(`🎨 Tema aplicado para categoría: ${categoria}`);
    }
}

// ===== INICIALIZACIÓN MEJORADA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Iniciando Negocio Vecino v2.1.0 - Sistema de Slider...');
    
    try {
        const negocioEncontrado = cargarNegocioSeleccionado();
        
        initializeApp();
        setupEventListeners();
        applyTheme();
        addSliderStyles(); // Agregar estilos del slider
        renderProductos();
        updateCarrito();
        updateFavoritos();
        updateAdminStats();
        updateCurrentDate();
        
        setTimeout(() => {
            document.body.classList.add('loaded');
            console.log('✅ Negocio Vecino cargado correctamente');
            
            if (negocioEncontrado) {
                console.log(`🎯 Conectado con: ${negocioActual.nombre}`);
            } else {
                console.log('🏪 Modo genérico - sin negocio específico');
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        showToast('Error al cargar la aplicación', 'error');
    }
});

// ===== AGREGAR ESTILOS CSS PARA EL SLIDER =====
function addSliderStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para el nuevo sistema de slider */
        .cantidad-slider-container {
            background: var(--bg-secondary);
            border-radius: var(--border-radius-md);
            padding: var(--spacing-md);
            margin: var(--spacing-md) 0;
            border: 1px solid var(--border-color);
        }

        .slider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);
        }

        .slider-label {
            font-size: 0.875rem;
            font-weight: var(--font-weight-medium);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .cantidad-display {
            font-size: 1rem;
            font-weight: var(--font-weight-semibold);
            color: var(--primary-color);
        }

        .cantidad-slider {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: var(--border-color);
            outline: none;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            cursor: pointer;
            -webkit-appearance: none;
        }

        .cantidad-slider:hover {
            opacity: 1;
        }

        .cantidad-slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        }

        .cantidad-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .cantidad-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .precio-dinamico {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: var(--spacing-sm);
            padding-top: var(--spacing-sm);
            border-top: 1px solid var(--border-color);
        }

        .precio-total {
            font-size: 1.25rem;
            font-weight: var(--font-weight-bold);
            color: var(--success-color);
        }

        .precio-unidad {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .stock-info {
            font-size: 0.75rem;
            margin-top: var(--spacing-xs);
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }

        .stock-info.sin-stock {
            color: var(--error-color);
        }

        .stock-info.stock-warning {
            color: var(--warning-color);
        }

        .stock-info.stock-low {
            color: var(--primary-color);
        }

        .stock-info.stock-ok {
            color: var(--success-color);
        }

        .slider-actions {
            display: flex;
            gap: var(--spacing-sm);
            margin-top: var(--spacing-md);
        }

        .btn-quick-adjust {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-quick-adjust:hover {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .btn-add-cart-slider {
            flex: 1;
            background: var(--gradient-primary);
            border: none;
            border-radius: var(--border-radius-md);
            padding: var(--spacing-md);
            color: white;
            font-weight: var(--font-weight-medium);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-add-cart-slider:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(230, 126, 34, 0.4);
        }

        .btn-add-cart-slider:disabled {
            background: var(--border-color);
            cursor: not-allowed;
            opacity: 0.6;
        }

        .btn-add-cart-slider .btn-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .cantidad-slider-container {
                padding: var(--spacing-sm);
            }
            
            .slider-header {
                flex-direction: column;
                align-items: flex-start;
                gap: var(--spacing-xs);
            }
            
            .precio-dinamico {
                flex-direction: column;
                align-items: flex-start;
                gap: var(--spacing-xs);
            }
        }
    `;
    document.head.appendChild(style);
    console.log('🎨 Estilos del slider agregados');
}

function initializeApp() {
    showInterface('cliente');
    checkElements();
    setupServiceWorker();
    checkBrowserSupport();
}

function setupServiceWorker() {
    console.log('ℹ️ Service Worker: Desactivado (desarrollo)');
}

function checkBrowserSupport() {
    const features = ['localStorage', 'FileReader', 'fetch'];
    const unsupported = features.filter(feature => !(feature in window));
    
    if (unsupported.length > 0) {
        showToast('Algunas funciones pueden no estar disponibles en este navegador', 'warning');
    }
}

function checkElements() {
    const requiredElements = {
        'productosGrid': productosGrid,
        'carritoItems': carritoItems,
        'totalAmount': totalAmount,
        'carritoCount': carritoCount,
        'pedidosContainer': pedidosContainer
    };
    
    Object.entries(requiredElements).forEach(([name, element]) => {
        if (!element) {
            console.warn(`Elemento ${name} no encontrado en el DOM`);
        }
    });
}

// ===== EVENT LISTENERS AVANZADOS =====
function setupEventListeners() {
    clienteBtn?.addEventListener('click', () => showInterface('cliente'));
    negocioBtn?.addEventListener('click', () => showInterface('negocio'));
    themeToggle?.addEventListener('click', toggleTheme);
    
    searchInput?.addEventListener('input', handleSearch);
    clearSearch?.addEventListener('click', clearSearchInput);
    sortSelect?.addEventListener('change', handleSort);
    gridView?.addEventListener('click', () => setView('grid'));
    listView?.addEventListener('click', () => setView('list'));
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setCategory(e.target.dataset.category);
        });
    });
    
    toggleCarrito?.addEventListener('click', toggleCarritoVisibility);
    clearCart?.addEventListener('click', clearCarrito);
    finalizarPedido?.addEventListener('click', showModalPedido);
    
    document.getElementById('agregarProducto')?.addEventListener('click', () => showModalProducto());
    document.getElementById('agregarProductoSecundario')?.addEventListener('click', () => showModalProducto());
    document.getElementById('searchProductosAdmin')?.addEventListener('input', handleAdminSearch);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterPedidos(e.target.dataset.filter);
        });
    });
    
    setupModalListeners();
    setupTabListeners();
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    setupIntersectionObserver();
}

function setupModalListeners() {
    document.getElementById('cancelarPedido')?.addEventListener('click', closeModal);
    document.getElementById('confirmarPedido')?.addEventListener('click', procesarPedido);
    
    document.getElementById('cancelarProducto')?.addEventListener('click', closeModal);
    document.getElementById('guardarProducto')?.addEventListener('click', guardarProducto);
    document.getElementById('productoImagen')?.addEventListener('change', previewImagen);
    
    document.getElementById('cerrarConfirmacion')?.addEventListener('click', closeModal);
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    });
    
    document.querySelector('.btn-apply-discount')?.addEventListener('click', aplicarDescuento);
}

function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'k':
                e.preventDefault();
                searchInput?.focus();
                break;
            case 'n':
                e.preventDefault();
                if (negocioInterface.classList.contains('active')) {
                    showModalProducto();
                }
                break;
            case 'Enter':
                if (modalPedido.classList.contains('active')) {
                    e.preventDefault();
                    procesarPedido();
                }
                break;
        }
    }
    
    if (e.key === 'Escape') {
        closeModal();
    }
}

function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.producto-card, .stat-card, .action-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== TEMA Y APARIENCIA =====
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
    showToast(`Tema ${currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// ===== NAVEGACIÓN MEJORADA =====
function showInterface(type) {
    showLoading();
    
    setTimeout(() => {
        if (type === 'cliente') {
            clienteBtn?.classList.add('active');
            negocioBtn?.classList.remove('active');
            clienteInterface?.classList.add('active');
            negocioInterface?.classList.remove('active');
            updateClienteStats();
        } else {
            negocioBtn?.classList.add('active');
            clienteBtn?.classList.remove('active');
            negocioInterface?.classList.add('active');
            clienteInterface?.classList.remove('active');
            
            if (productosAdmin) renderProductosAdmin();
            if (pedidosContainer) renderPedidos();
            updateAdminStats();
        }
        hideLoading();
    }, 200);
}

// ===== BÚSQUEDA Y FILTROS AVANZADOS =====
function handleSearch(e) {
    const term = e.target.value.trim();
    searchTerm = term;
    
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        renderProductos();
        updateSearchUI();
    }, window.NegocioVecinoConfig.searchDelay);
}

function updateSearchUI() {
    if (clearSearch) {
        clearSearch.style.display = searchTerm ? 'block' : 'none';
    }
    
    const count = getFilteredProducts().length;
    if (document.getElementById('productosTitle')) {
        document.getElementById('productosTitle').textContent = 
            searchTerm ? `Resultados para "${searchTerm}" (${count})` : 'Nuestros Productos';
    }
}

function clearSearchInput() {
    if (searchInput) {
        searchInput.value = '';
        searchTerm = '';
        renderProductos();
        updateSearchUI();
        searchInput.focus();
    }
}

function handleSort(e) {
    currentSort = e.target.value;
    renderProductos();
    showToast('Productos reordenados', 'info');
}

function setCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    renderProductos();
    showToast(`Filtrado por: ${getCategoryName(category)}`, 'info');
}

function setView(view) {
    currentView = view;
    
    gridView?.classList.toggle('active', view === 'grid');
    listView?.classList.toggle('active', view === 'list');
    
    if (productosGrid) {
        productosGrid.classList.toggle('list-view', view === 'list');
    }
    
    showToast(`Vista ${view === 'grid' ? 'cuadrícula' : 'lista'} activada`, 'info');
}

function getCategoryName(category) {
    const names = {
        'all': 'Todos',
        'panaderia': 'Panadería',
        'lacteos': 'Lácteos', 
        'verduras': 'Verduras',
        'otros': 'Otros'
    };
    return names[category] || category;
}

// ===== PRODUCTOS CON NUEVO SISTEMA DE SLIDER =====
function getFilteredProducts() {
    let filtered = productos.filter(p => p.activo);
    
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.categoria === currentCategory);
    }
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.nombre.toLowerCase().includes(term) ||
            p.descripcion.toLowerCase().includes(term)
        );
    }
    
    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'precio-asc':
                return a.precioUnidad - b.precioUnidad;
            case 'precio-desc':
                return b.precioUnidad - a.precioUnidad;
            case 'favoritos':
                const aFav = favoritos.includes(a.id) ? 1 : 0;
                const bFav = favoritos.includes(b.id) ? 1 : 0;
                return bFav - aFav;
            default:
                return a.nombre.localeCompare(b.nombre);
        }
    });
    
    return filtered.sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return 0;
    });
}

function renderProductos() {
    if (!productosGrid) {
        console.warn('productosGrid no encontrado');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        const filtered = getFilteredProducts();
        
        if (filtered.length === 0) {
            productosGrid.innerHTML = '';
            if (noResultsMessage) {
                noResultsMessage.classList.remove('hidden');
                noResultsMessage.style.setProperty('display', 'block');
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.classList.add('hidden');
                noResultsMessage.style.setProperty('display', 'none');
            }
            
            productosGrid.innerHTML = '';
            filtered.forEach((producto, index) => {
                const card = createProductoCardWithSlider(producto);
                card.style.animationDelay = `${index * 0.1}s`;
                productosGrid.appendChild(card);
            });
        }
        
        updateClienteStats();
        hideLoading();
    }, 300);
}

// ===== NUEVA FUNCIÓN PARA CREAR TARJETA CON SLIDER =====
function createProductoCardWithSlider(producto) {
    const card = document.createElement('div');
    card.className = `producto-card ${producto.destacado ? 'destacado' : ''}`;
    
    // Calcular valores iniciales
    const cantidadInicial = producto.cantidadMinima;
    const precioInicial = calcularPrecioTotal(producto, cantidadInicial);
    const unidadFormateada = formatearUnidad(producto, cantidadInicial);
    const stockInfo = getStockInfo(producto, cantidadInicial);
    
    card.innerHTML = `
        <div class="producto-image">
            ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">` : '<i class="fas fa-image"></i>'}
            <button class="producto-favorite ${favoritos.includes(producto.id) ? 'active' : ''}" 
                    onclick="toggleFavorito(${producto.id})" 
                    title="${favoritos.includes(producto.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="producto-info">
            <div class="producto-nombre">${producto.nombre}</div>
            <div class="producto-descripcion">${producto.descripcion}</div>
            
            <!-- NUEVO SISTEMA DE SLIDER -->
            <div class="cantidad-slider-container">
                <div class="slider-header">
                    <div class="slider-label">
                        <i class="fas fa-sliders-h"></i>
                        Cantidad:
                    </div>
                    <div class="cantidad-display" id="cantidad-display-${producto.id}">
                        ${unidadFormateada}
                    </div>
                </div>
                
                <input type="range" 
                       class="cantidad-slider" 
                       id="slider-${producto.id}"
                       min="${producto.cantidadMinima}" 
                       max="${Math.min(producto.cantidadMaxima, producto.stockTotal)}"
                       step="${producto.incremento}"
                       value="${cantidadInicial}"
                       onchange="updateSliderValue(${producto.id})"
                       oninput="updateSliderValue(${producto.id})">
                
                <div class="precio-dinamico">
                    <div>
                        <div class="precio-total" id="precio-total-${producto.id}">
                            $${formatPrice(precioInicial)}
                        </div>
                        <div class="precio-unidad">
                            $${formatPrice(producto.precioUnidad)} por ${producto.unidadMedida}
                        </div>
                    </div>
                </div>
                
                <div class="stock-info ${stockInfo.clase}" id="stock-info-${producto.id}">
                    ${stockInfo.icon} ${stockInfo.texto}
                </div>
                
                <!-- Botones de ajuste rápido -->
                <div class="slider-actions">
                    <button class="btn-quick-adjust" onclick="adjustSlider(${producto.id}, 'min')">
                        Mín (${producto.cantidadMinima})
                    </button>
                    <button class="btn-quick-adjust" onclick="adjustSlider(${producto.id}, 'mid')">
                        Medio
                    </button>
                    <button class="btn-quick-adjust" onclick="adjustSlider(${producto.id}, 'max')">
                        Máx
                    </button>
                </div>
            </div>
            
            <button class="btn-add-cart-slider" 
                    onclick="addToCartWithSlider(${producto.id})" 
                    id="btn-cart-${producto.id}"
                    ${producto.stockTotal === 0 ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i>
                ${producto.stockTotal === 0 ? 'Sin stock' : 'Agregar al carrito'}
                <div class="btn-ripple"></div>
            </button>
        </div>
    `;
    
    return card;
}

// ===== FUNCIONES PARA EL SISTEMA DE SLIDER =====

// Actualizar valores cuando cambia el slider
function updateSliderValue(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const slider = document.getElementById(`slider-${productoId}`);
    const cantidadDisplay = document.getElementById(`cantidad-display-${productoId}`);
    const precioTotal = document.getElementById(`precio-total-${productoId}`);
    const stockInfo = document.getElementById(`stock-info-${productoId}`);
    const addButton = document.getElementById(`btn-cart-${productoId}`);
    
    if (!slider) return;
    
    const cantidad = parseInt(slider.value);
    const precio = calcularPrecioTotal(producto, cantidad);
    const unidadFormateada = formatearUnidad(producto, cantidad);
    const stockData = getStockInfo(producto, cantidad);
    
    // Actualizar displays
    if (cantidadDisplay) {
        cantidadDisplay.textContent = unidadFormateada;
    }
    
    if (precioTotal) {
        precioTotal.textContent = `$${formatPrice(precio)}`;
        
        // Animación de precio
        precioTotal.style.transform = 'scale(1.05)';
        setTimeout(() => {
            precioTotal.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (stockInfo) {
        stockInfo.textContent = `${stockData.icon} ${stockData.texto}`;
        stockInfo.className = `stock-info ${stockData.clase}`;
    }
    
    // Actualizar botón
    if (addButton) {
        const stockDisponible = verificarStock(producto, cantidad);
        addButton.disabled = !stockDisponible;
        
        if (!stockDisponible) {
            addButton.innerHTML = '<i class="fas fa-cart-plus"></i> Sin stock suficiente';
        } else {
            addButton.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al carrito <div class="btn-ripple"></div>';
        }
    }
}

// Ajustar slider a valores predefinidos
function adjustSlider(productoId, type) {
    const producto = productos.find(p => p.id === productoId);
    const slider = document.getElementById(`slider-${productoId}`);
    
    if (!producto || !slider) return;
    
    let newValue;
    const min = producto.cantidadMinima;
    const max = Math.min(producto.cantidadMaxima, producto.stockTotal);
    
    switch(type) {
        case 'min':
            newValue = min;
            break;
        case 'mid':
            newValue = Math.round((min + max) / 2);
            break;
        case 'max':
            newValue = max;
            break;
        default:
            return;
    }
    
    slider.value = newValue;
    updateSliderValue(productoId);
    
    // Feedback visual
    slider.style.transform = 'scale(1.05)';
    setTimeout(() => {
        slider.style.transform = 'scale(1)';
    }, 150);
}

// Agregar al carrito con el nuevo sistema
function addToCartWithSlider(productoId) {
    const producto = productos.find(p => p.id === productoId);
    const slider = document.getElementById(`slider-${productoId}`);
    
    if (!producto || !slider) {
        showToast('Error al agregar producto', 'error');
        return;
    }
    
    const cantidad = parseInt(slider.value);
    
    if (!verificarStock(producto, cantidad)) {
        showToast('Stock insuficiente', 'error');
        return;
    }
    
    // Buscar si ya existe en el carrito
    const existingItem = carrito.find(item => item.productoId === productoId);
    
    if (existingItem) {
        const nuevaCantidad = existingItem.cantidad + cantidad;
        if (!verificarStock(producto, nuevaCantidad)) {
            showToast(`Solo puedes agregar ${producto.stockTotal - existingItem.cantidad} unidades más`, 'warning');
            return;
        }
        existingItem.cantidad = nuevaCantidad;
        existingItem.precioTotal = calcularPrecioTotal(producto, nuevaCantidad);
        existingItem.unidadFormateada = formatearUnidad(producto, nuevaCantidad);
    } else {
        carrito.push({
            id: `${productoId}_${Date.now()}`, // ID único
            productoId: productoId,
            nombre: producto.nombre,
            cantidad: cantidad,
            precioUnidad: producto.precioUnidad,
            precioTotal: calcularPrecioTotal(producto, cantidad),
            unidadMedida: producto.unidadMedida,
            unidadFormateada: formatearUnidad(producto, cantidad),
            imagen: producto.imagen
        });
    }
    
    updateCarrito();
    animateAddToCart(productoId);
    showToast(`${producto.nombre} agregado al carrito`, 'success');
}

// ===== FAVORITOS =====
function toggleFavorito(productoId) {
    const index = favoritos.indexOf(productoId);
    const btn = document.querySelector(`.producto-favorite[onclick*="${productoId}"]`);
    
    if (index === -1) {
        favoritos.push(productoId);
        btn?.classList.add('active');
        btn?.setAttribute('title', 'Quitar de favoritos');
        showToast('Agregado a favoritos ❤️', 'success');
    } else {
        favoritos.splice(index, 1);
        btn?.classList.remove('active');
        btn?.setAttribute('title', 'Agregar a favoritos');
        showToast('Quitado de favoritos', 'info');
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    updateFavoritos();
    updateClienteStats();
}

function updateFavoritos() {
    if (!favoritosGrid || !favoritosSection) return;
    
    const productosFavoritos = productos.filter(p => favoritos.includes(p.id));
    
    if (productosFavoritos.length === 0) {
        favoritosSection.style.display = 'none';
    } else {
        favoritosSection.style.display = 'block';
        favoritosGrid.innerHTML = '';
        
        productosFavoritos.forEach(producto => {
            const card = createProductoCardWithSlider(producto);
            favoritosGrid.appendChild(card);
        });
    }
}

function animateAddToCart(productoId) {
    const btn = document.querySelector(`#btn-cart-${productoId}`);
    if (btn && carritoFlotante) {
        const rect1 = btn.getBoundingClientRect();
        const rect2 = carritoFlotante.getBoundingClientRect();
        
        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-item';
        flyingItem.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        flyingItem.style.cssText = `
            position: fixed;
            left: ${rect1.left}px;
            top: ${rect1.top}px;
            z-index: 10000;
            background: var(--primary-color);
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        document.body.appendChild(flyingItem);
        
        setTimeout(() => {
            flyingItem.style.left = rect2.left + 'px';
            flyingItem.style.top = rect2.top + 'px';
            flyingItem.style.transform = 'scale(0)';
            flyingItem.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            flyingItem.remove();
        }, 850);
    }
}

function removeFromCart(itemId) {
    const item = carrito.find(item => item.id === itemId);
    carrito = carrito.filter(item => item.id !== itemId);
    updateCarrito();
    showToast(`${item?.nombre} eliminado del carrito`, 'info');
}

function updateCartItemQuantity(itemId, newQuantity) {
    const item = carrito.find(item => item.id === itemId);
    if (!item) return;
    
    const producto = productos.find(p => p.id === item.productoId);
    if (!producto) return;
    
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    if (!verificarStock(producto, newQuantity)) {
        showToast(`Solo hay ${producto.stockTotal} unidades disponibles`, 'warning');
        return;
    }
    
    item.cantidad = newQuantity;
    item.precioTotal = calcularPrecioTotal(producto, newQuantity);
    item.unidadFormateada = formatearUnidad(producto, newQuantity);
    
    updateCarrito();
}

function clearCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        updateCarrito();
        showToast('Carrito vaciado', 'info');
    }
}

function updateCarrito() {
    if (!carritoItems || !totalAmount || !carritoCount) {
        console.warn('Elementos del carrito no encontrados');
        return;
    }
    
    const itemCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    carritoCount.textContent = itemCount;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = `
            <div class="carrito-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <small>Agrega productos para comenzar</small>
            </div>
        `;
        if (finalizarPedido) finalizarPedido.disabled = true;
        totalAmount.textContent = '$0';
        if (subtotalAmount) subtotalAmount.textContent = '$0';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    carrito.forEach(item => {
        subtotal += item.precioTotal;
        
        html += `
            <div class="carrito-item">
                <div class="item-info">
                    <div class="item-nombre">${item.nombre}</div>
                    <div class="item-details">${item.unidadFormateada}</div>
                </div>
                <div class="item-precio">$${formatPrice(item.precioTotal)}</div>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    carritoItems.innerHTML = html;
    
    const descuento = subtotal * descuentoAplicado;
    const total = subtotal - descuento;
    
    if (subtotalAmount) subtotalAmount.textContent = `$${formatPrice(subtotal)}`;
    totalAmount.textContent = `$${formatPrice(total)}`;
    if (finalizarPedido) finalizarPedido.disabled = false;
    
    if (carritoCount) {
        carritoCount.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            carritoCount.style.animation = '';
        }, 600);
    }
}

function toggleCarritoVisibility() {
    carritoFlotante?.classList.toggle('collapsed');
    
    const icon = toggleCarrito?.querySelector('i');
    if (icon) {
        icon.className = carritoFlotante?.classList.contains('collapsed') ? 
            'fas fa-chevron-up' : 'fas fa-chevron-down';
    }
}

// ===== GESTIÓN DE PEDIDOS MEJORADA =====
function showModalPedido() {
    if (carrito.length === 0) {
        showToast('El carrito está vacío', 'warning');
        return;
    }
    
    updatePedidoResumen();
    configurarHoraMinima();
    switchTab('resumen');
    showModal('modalPedido');
}

function updatePedidoResumen() {
    const resumenItems = document.getElementById('resumenItems');
    const resumenSubtotal = document.getElementById('resumenSubtotal');
    const resumenDescuento = document.getElementById('resumenDescuento');
    const resumenTotal = document.getElementById('resumenTotal');
    
    if (!resumenItems) return;
    
    let html = '';
    let subtotal = 0;
    
    carrito.forEach(item => {
        subtotal += item.precioTotal;
        
        html += `
            <div class="resumen-item">
                <span>${item.unidadFormateada} de ${item.nombre}</span>
                <span>$${formatPrice(item.precioTotal)}</span>
            </div>
        `;
    });
    
    const descuento = subtotal * descuentoAplicado;
    const total = subtotal - descuento;
    
    resumenItems.innerHTML = html;
    if (resumenSubtotal) resumenSubtotal.textContent = `$${formatPrice(subtotal)}`;
    if (resumenDescuento) resumenDescuento.textContent = descuento > 0 ? `-$${formatPrice(descuento)}` : '-$0';
    if (resumenTotal) resumenTotal.textContent = `$${formatPrice(total)}`;
}

function configurarHoraMinima() {
    const horaRetiroInput = document.getElementById('horaRetiro');
    if (!horaRetiroInput) return;
    
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const timeString = nextHour.toTimeString().slice(0, 5);
    
    horaRetiroInput.value = timeString;
    horaRetiroInput.min = timeString;
}

function switchTab(tabName) {
    currentTab = tabName;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tab === tabName);
    });
    
    if (tabName === 'resumen') {
        updatePedidoResumen();
    }
}

function aplicarDescuento() {
    const codigoInput = document.getElementById('codigoDescuento');
    if (!codigoInput) return;
    
    const codigo = codigoInput.value.trim().toUpperCase();
    
    if (!codigo) {
        showToast('Ingresa un código de descuento', 'warning');
        return;
    }
    
    if (window.NegocioVecinoConfig.discountCodes[codigo]) {
        descuentoAplicado = window.NegocioVecinoConfig.discountCodes[codigo];
        codigoDescuentoActual = codigo;
        
        updatePedidoResumen();
        updateCarrito();
        
        const porcentaje = Math.round(descuentoAplicado * 100);
        showToast(`¡Descuento del ${porcentaje}% aplicado!`, 'success');
        
        codigoInput.disabled = true;
        document.querySelector('.btn-apply-discount').textContent = '✓ Aplicado';
        document.querySelector('.btn-apply-discount').disabled = true;
    } else {
        showToast('Código de descuento inválido', 'error');
    }
}

function procesarPedido() {
    showLoading('Procesando pedido...');
    
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked')?.value;
    const horaRetiro = document.getElementById('horaRetiro')?.value;
    const nombreCliente = document.getElementById('nombreCliente')?.value?.trim();
    const telefonoCliente = document.getElementById('telefonoCliente')?.value?.trim();
    const comentarios = document.getElementById('comentarios')?.value?.trim();
    
    if (!metodoPago) {
        hideLoading();
        showToast('Selecciona un método de pago', 'error');
        switchTab('pago');
        return;
    }
    
    if (!horaRetiro) {
        hideLoading();
        showToast('Selecciona una hora de retiro', 'error');
        switchTab('entrega');
        return;
    }
    
    if (!nombreCliente) {
        hideLoading();
        showToast('Ingresa tu nombre', 'error');
        switchTab('entrega');
        document.getElementById('nombreCliente')?.focus();
        return;
    }
    
    setTimeout(() => {
        const subtotal = carrito.reduce((sum, item) => sum + item.precioTotal, 0);
        const descuento = subtotal * descuentoAplicado;
        const total = subtotal - descuento;
        
        const pedido = {
            id: pedidoIdCounter++,
            items: [...carrito],
            subtotal: subtotal,
            descuento: descuento,
            total: total,
            metodoPago: metodoPago,
            horaRetiro: horaRetiro,
            nombreCliente: nombreCliente,
            telefonoCliente: telefonoCliente,
            comentarios: comentarios,
            codigoDescuento: codigoDescuentoActual,
            fecha: new Date(),
            estado: 'pendiente',
            negocio: negocioActual ? {
                id: negocioActual.id,
                nombre: negocioActual.nombre
            } : null
        };
        
        pedidos.push(pedido);
        
        // Actualizar stock
        carrito.forEach(item => {
            const producto = productos.find(p => p.id === item.productoId);
            if (producto) {
                producto.stockTotal -= item.cantidad;
            }
        });
        
        updateConfirmacion(pedido);
        
        carrito = [];
        descuentoAplicado = 0;
        codigoDescuentoActual = '';
        
        updateCarrito();
        updateAdminStats();
        renderProductos();
        
        hideLoading();
        closeModal();
        showModal('modalConfirmacion');
        
        setTimeout(() => {
            showToast('¡Pedido enviado correctamente!', 'success');
            
            setTimeout(() => {
                showToast('Nuevo pedido recibido en administración', 'info');
            }, 2000);
        }, 500);
    }, 2000);
}

function updateConfirmacion(pedido) {
    const elements = {
        confirmacionHora: document.getElementById('confirmacionHora'),
        confirmacionTotal: document.getElementById('confirmacionTotal'),
        confirmacionPago: document.getElementById('confirmacionPago'),
        confirmacionNombre: document.getElementById('confirmacionNombre')
    };
    
    if (elements.confirmacionHora) elements.confirmacionHora.textContent = pedido.horaRetiro;
    if (elements.confirmacionTotal) elements.confirmacionTotal.textContent = `$${formatPrice(pedido.total)}`;
    if (elements.confirmacionPago) elements.confirmacionPago.textContent = getMetodoPagoText(pedido.metodoPago);
    if (elements.confirmacionNombre) elements.confirmacionNombre.textContent = pedido.nombreCliente;
}

function getMetodoPagoText(metodo) {
    const metodos = {
        'efectivo': 'Pago en efectivo al retirar',
        'tarjeta': 'Pago con tarjeta en el negocio',
        'pagado': 'Ya pagado (transferencia/online)'
    };
    return metodos[metodo] || metodo;
}

// ===== GESTIÓN ADMIN CON NUEVO SISTEMA =====
function renderProductosAdmin() {
    if (!productosAdmin) return;
    
    const searchTerm = document.getElementById('searchProductosAdmin')?.value?.toLowerCase() || '';
    let filtered = productos;
    
    if (searchTerm) {
        filtered = productos.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.descripcion.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        productosAdmin.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search-minus"></i>
                <h4>No se encontraron productos</h4>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    productosAdmin.innerHTML = '';
    filtered.forEach(producto => {
        const card = createProductoAdminCard(producto);
        productosAdmin.appendChild(card);
    });
}

function createProductoAdminCard(producto) {
    const card = document.createElement('div');
    
    const stockStatus = producto.stockTotal <= 5 ? 'low-stock' : 
                       producto.stockTotal <= 10 ? 'medium-stock' : 'good-stock';
    
    card.className = 'producto-admin-card';
    card.innerHTML = `
        <div class="producto-image">
            ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}">` : '<i class="fas fa-image"></i>'}
        </div>
        <div class="producto-info">
            <div class="producto-nombre">${producto.nombre}</div>
            <div class="producto-descripcion">${producto.descripcion}</div>
            
            <!-- INFO NUEVA ESTRUCTURA -->
            <div class="producto-pricing">
                <div class="precio-info">
                    <span class="precio-label">Precio por ${producto.unidadMedida}:</span>
                    <span class="precio-value">$${formatPrice(producto.precioUnidad)}</span>
                </div>
                <div class="cantidad-info">
                    <span class="cantidad-label">Rango:</span>
                    <span class="cantidad-value">${producto.cantidadMinima} - ${producto.cantidadMaxima} ${producto.unidadMedida}</span>
                </div>
            </div>
            
            <div class="produto-meta">
                <span class="categoria-badge ${producto.categoria}">${getCategoryName(producto.categoria)}</span>
                <span class="stock-info ${stockStatus}">
                    Stock: ${producto.stockTotal}
                </span>
            </div>
            ${!producto.activo ? '<div class="inactive-badge">Inactivo</div>' : ''}
            ${producto.destacado ? '<div class="featured-badge">⭐ Destacado</div>' : ''}
        </div>
        <div class="producto-admin-actions">
            <button class="btn-primary btn-edit" onclick="editarProducto(${producto.id})" title="Editar producto">
                <i class="fas fa-edit"></i>
                Editar
            </button>
            <button class="btn-primary ${producto.activo ? 'btn-warning' : 'btn-success'}" 
                    onclick="toggleProductoActivo(${producto.id})" 
                    title="${producto.activo ? 'Desactivar' : 'Activar'} producto">
                <i class="fas fa-${producto.activo ? 'eye-slash' : 'eye'}"></i>
                ${producto.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button class="btn-primary btn-danger" onclick="eliminarProducto(${producto.id})" title="Eliminar producto">
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </div>
    `;
    return card;
}

function handleAdminSearch(e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        renderProductosAdmin();
    }, window.NegocioVecinoConfig.searchDelay);
}

function showModalProducto(productoId = null) {
    currentEditingProduct = productoId;
    const modal = document.getElementById('modalProducto');
    const title = document.getElementById('modalProductoTitle');
    
    if (productoId) {
        title.innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
        const producto = productos.find(p => p.id === productoId);
        fillProductForm(producto);
    } else {
        title.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
        clearProductForm();
    }
    
    showModal('modalProducto');
}

function fillProductForm(producto) {
    if (!producto) return;
    
    const elements = {
        productoNombre: document.getElementById('productoNombre'),
        productoDescripcion: document.getElementById('productoDescripcion'),
        productoCategoria: document.getElementById('productoCategoria'),
        productoDestacado: document.getElementById('productoDestacado'),
        productoActivo: document.getElementById('productoActivo')
    };
    
    if (elements.productoNombre) elements.productoNombre.value = producto.nombre;
    if (elements.productoDescripcion) elements.productoDescripcion.value = producto.descripcion;
    if (elements.productoCategoria) elements.productoCategoria.value = producto.categoria;
    if (elements.productoDestacado) elements.productoDestacado.checked = producto.destacado;
    if (elements.productoActivo) elements.productoActivo.checked = producto.activo;
    
    if (producto.imagen) {
        document.getElementById('imagenPreview').innerHTML = 
            `<img src="${producto.imagen}" alt="Preview">`;
    }
}

function clearProductForm() {
    document.getElementById('formProducto')?.reset();
    document.getElementById('imagenPreview').innerHTML = '';
    
    const elements = {
        productoActivo: document.getElementById('productoActivo')
    };
    
    if (elements.productoActivo) elements.productoActivo.checked = true;
}

function guardarProducto() {
    showToast('Función en desarrollo - Sistema de slider', 'info');
}

function editarProducto(productoId) {
    showModalProducto(productoId);
}

function toggleProductoActivo(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    producto.activo = !producto.activo;
    
    renderProductos();
    renderProductosAdmin();
    
    showToast(
        `Producto ${producto.activo ? 'activado' : 'desactivado'}`, 
        producto.activo ? 'success' : 'warning'
    );
}

function eliminarProducto(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    if (!confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
        return;
    }
    
    productos = productos.filter(p => p.id !== productoId);
    
    carrito = carrito.filter(item => item.productoId !== productoId);
    
    const favIndex = favoritos.indexOf(productoId);
    if (favIndex !== -1) {
        favoritos.splice(favIndex, 1);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    }
    
    renderProductos();
    renderProductosAdmin();
    updateCarrito();
    updateFavoritos();
    updateAdminStats();
    
    showToast('Producto eliminado correctamente', 'success');
}

function previewImagen(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagenPreview');
    
    if (!preview) return;
    
    if (file) {
        if (file.size > window.NegocioVecinoConfig.maxImageSize) {
            showToast('La imagen es muy grande (máx. 2MB)', 'error');
            event.target.value = '';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showToast('Por favor selecciona una imagen válida', 'error');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// ===== GESTIÓN DE PEDIDOS ADMIN (Mantenida igual) =====
function renderPedidos() {
    if (!pedidosContainer) return;
    
    const filteredPedidos = getFilteredPedidos();
    
    if (filteredPedidos.length === 0) {
        pedidosContainer.innerHTML = `
            <div class="no-pedidos">
                <i class="fas fa-clipboard-list"></i>
                <h4>No hay pedidos</h4>
                <p>Los nuevos pedidos aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    pedidosContainer.innerHTML = '';
    filteredPedidos.forEach(pedido => {
        const card = createPedidoCard(pedido);
        pedidosContainer.appendChild(card);
    });
}

function getFilteredPedidos() {
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    
    if (activeFilter === 'all') {
        return pedidos;
    }
    
    return pedidos.filter(p => p.estado === activeFilter);
}

function createPedidoCard(pedido) {
    const card = document.createElement('div');
    card.className = `pedido-card ${pedido.estado}`;
    
    const fechaFormat = pedido.fecha.toLocaleDateString('es-CL');
    const horaFormat = pedido.fecha.toLocaleTimeString('es-CL').slice(0, 5);
    
    let statusColor = 'warning';
    let statusText = 'Pendiente';
    let statusIcon = 'clock';
    
    switch(pedido.estado) {
        case 'recibido':
            statusColor = 'info';
            statusText = 'Recibido';
            statusIcon = 'envelope-open';
            break;
        case 'confirmado':
            statusColor = 'primary';
            statusText = 'Confirmado';
            statusIcon = 'check';
            break;
        case 'listo':
            statusColor = 'success';
            statusText = 'Listo para retiro';
            statusIcon = 'check-circle';
            break;
        case 'completado':
            statusColor = 'success';
            statusText = 'Completado';
            statusIcon = 'thumbs-up';
            break;
        case 'rechazado':
            statusColor = 'error';
            statusText = 'Rechazado';
            statusIcon = 'times';
            break;
    }
    
    let itemsHtml = '';
    pedido.items.forEach(item => {
        itemsHtml += `
            <div class="pedido-item">
                <span>${item.unidadFormateada} de ${item.nombre}</span>
                <span>$${formatPrice(item.precioTotal)}</span>
            </div>
        `;
    });

    let actionsHtml = '';
    
    if (pedido.estado === 'pendiente') {
        actionsHtml = `
            <div class="pedido-actions">
                <button class="btn-primary btn-info" onclick="marcarRecibido(${pedido.id})" title="Marcar como recibido">
                    <i class="fas fa-envelope-open"></i>
                    Recibido
                </button>
                <button class="btn-primary btn-danger" onclick="rechazarPedido(${pedido.id})" title="Rechazar pedido">
                    <i class="fas fa-times"></i>
                    Rechazar
                </button>
            </div>
        `;
    } else if (pedido.estado === 'recibido') {
        actionsHtml = `
            <div class="pedido-actions">
                <button class="btn-primary btn-success" onclick="confirmarPedido(${pedido.id})" title="Confirmar pedido">
                    <i class="fas fa-check"></i>
                    Confirmar
                </button>
                <button class="btn-primary btn-danger" onclick="rechazarPedido(${pedido.id})" title="Rechazar pedido">
                    <i class="fas fa-times"></i>
                    Rechazar
                </button>
            </div>
        `;
    } else if (pedido.estado === 'confirmado') {
        actionsHtml = `
            <div class="pedido-actions">
                <button class="btn-primary btn-success" onclick="marcarListo(${pedido.id})" title="Marcar como listo">
                    <i class="fas fa-check-circle"></i>
                    Pedido Listo
                </button>
            </div>
        `;
    } else if (pedido.estado === 'listo') {
        actionsHtml = `
            <div class="pedido-actions">
                <button class="btn-primary btn-success" onclick="marcarCompletado(${pedido.id})" title="Marcar como entregado">
                    <i class="fas fa-thumbs-up"></i>
                    Entregado
                </button>
            </div>
        `;
    }
    
    let negocioInfo = '';
    if (pedido.negocio && pedido.negocio.nombre) {
        negocioInfo = `<p><strong>Negocio:</strong> ${pedido.negocio.nombre}</p>`;
    }
    
    card.innerHTML = `
        <div class="pedido-header">
            <h4>
                <i class="fas fa-${statusIcon}"></i>
                Pedido #${pedido.id}
            </h4>
            <span class="pedido-status ${pedido.estado}">${statusText}</span>
        </div>
        <div class="pedido-info">
            <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
            <p><strong>Fecha:</strong> ${fechaFormat} ${horaFormat}</p>
            <p><strong>Hora de retiro:</strong> ${pedido.horaRetiro}</p>
            <p><strong>Método de pago:</strong> ${getMetodoPagoText(pedido.metodoPago)}</p>
            ${negocioInfo}
            ${pedido.telefonoCliente ? `<p><strong>Teléfono:</strong> ${pedido.telefonoCliente}</p>` : ''}
            ${pedido.codigoDescuento ? `<p><strong>Descuento aplicado:</strong> ${pedido.codigoDescuento} (-$${formatPrice(pedido.descuento)})</p>` : ''}
            <p><strong>Total:</strong> $${formatPrice(pedido.total)}</p>
            ${pedido.comentarios ? `<p><strong>Comentarios:</strong> ${pedido.comentarios}</p>` : ''}
        </div>
        <div class="pedido-items">
            <h5>Productos:</h5>
            ${itemsHtml}
        </div>
        ${actionsHtml}
    `;
    
    return card;
}

function marcarRecibido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.estado = 'recibido';
    pedido.fechaRecibido = new Date();
    
    renderPedidos();
    updateAdminStats();
    
    showToast(`Pedido #${pedidoId} marcado como recibido`, 'info');
    
    setTimeout(() => {
        showToast('Cliente notificado: "Tu pedido ha sido recibido"', 'info');
    }, 1000);
}

function confirmarPedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.estado = 'confirmado';
    pedido.fechaConfirmacion = new Date();
    
    renderPedidos();
    updateAdminStats();
    
    showToast(`Pedido #${pedidoId} confirmado`, 'success');
    
    setTimeout(() => {
        showToast('Cliente notificado: "Tu pedido está confirmado y en preparación"', 'info');
    }, 1000);
}

function marcarListo(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.estado = 'listo';
    pedido.fechaListo = new Date();
    
    renderPedidos();
    updateAdminStats();
    
    showToast(`Pedido #${pedidoId} marcado como LISTO`, 'success');
    
    setTimeout(() => {
        showToast('Cliente notificado: "Tu pedido está listo para retirar"', 'success');
    }, 1000);
}

function marcarCompletado(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.estado = 'completado';
    pedido.fechaCompletado = new Date();
    
    renderPedidos();
    updateAdminStats();
    
    showToast(`Pedido #${pedidoId} completado - Cliente atendido`, 'success');
}

function rechazarPedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const motivo = prompt('Motivo del rechazo (opcional):');
    
    pedido.estado = 'rechazado';
    pedido.fechaRechazo = new Date();
    pedido.motivoRechazo = motivo;
    
    // Restaurar stock
    pedido.items.forEach(item => {
        const producto = productos.find(p => p.id === item.productoId);
        if (producto) {
            producto.stockTotal += item.cantidad;
        }
    });
    
    renderPedidos();
    renderProductos();
    renderProductosAdmin();
    updateAdminStats();
    
    showToast(`Pedido #${pedidoId} rechazado`, 'warning');
    
    setTimeout(() => {
        showToast(`Cliente notificado: "Pedido rechazado${motivo ? ' - ' + motivo : ''}"`, 'warning');
    }, 1000);
}

function filterPedidos(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderPedidos();
    
    const filterNames = {
        'all': 'todos los pedidos',
        'pendiente': 'pedidos pendientes',
        'recibido': 'pedidos recibidos',
        'confirmado': 'pedidos confirmados',
        'listo': 'pedidos listos',
        'completado': 'pedidos completados',
        'rechazado': 'pedidos rechazados'
    };
    
    showToast(`Mostrando ${filterNames[filter] || filter}`, 'info');
}

// ===== ESTADÍSTICAS Y ANALYTICS MEJORADAS =====
function updateAdminStats() {
    const elements = {
        totalProductos: document.getElementById('totalProductos'),
        pedidosPendientes: document.getElementById('pedidosPendientes'),
        totalVentas: document.getElementById('totalVentas'),
        clientesAtendidos: document.getElementById('clientesAtendidos')
    };
    
    const stats = calculateStats();
    
    if (elements.totalProductos) {
        animateNumber(elements.totalProductos, stats.totalProductos);
    }
    if (elements.pedidosPendientes) {
        animateNumber(elements.pedidosPendientes, stats.pedidosPendientes);
    }
    if (elements.totalVentas) {
        elements.totalVentas.textContent = `$${formatPrice(stats.totalVentas)}`;
    }
    if (elements.clientesAtendidos) {
        animateNumber(elements.clientesAtendidos, stats.clientesAtendidos);
    }
}

function updateClienteStats() {
    const elements = {
        totalProductosCliente: document.getElementById('totalProductosCliente'),
        totalFavoritos: document.getElementById('totalFavoritos')
    };
    
    const productosActivos = productos.filter(p => p.activo).length;
    
    if (elements.totalProductosCliente) {
        animateNumber(elements.totalProductosCliente, productosActivos);
    }
    if (elements.totalFavoritos) {
        animateNumber(elements.totalFavoritos, favoritos.length);
    }
}

function calculateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pedidosHoy = pedidos.filter(p => {
        const pedidoDate = new Date(p.fecha);
        pedidoDate.setHours(0, 0, 0, 0);
        return pedidoDate.getTime() === today.getTime();
    });
    
    return {
        totalProductos: productos.filter(p => p.activo).length,
        pedidosPendientes: pedidos.filter(p => ['pendiente', 'recibido', 'confirmado', 'listo'].includes(p.estado)).length,
        totalVentas: pedidosHoy.filter(p => ['confirmado', 'listo', 'completado'].includes(p.estado)).reduce((sum, p) => sum + p.total, 0),
        clientesAtendidos: pedidos.filter(p => p.estado === 'completado').length
    };
}

function animateNumber(element, targetNumber) {
    const currentNumber = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetNumber - currentNumber) / 20);
    
    if (currentNumber < targetNumber) {
        element.textContent = Math.min(currentNumber + increment, targetNumber);
        setTimeout(() => animateNumber(element, targetNumber), 50);
    } else if (currentNumber > targetNumber) {
        element.textContent = Math.max(currentNumber - increment, targetNumber);
        setTimeout(() => animateNumber(element, targetNumber), 50);
    }
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('es-CL', options);
    }
}

// ===== FUNCIONES AUXILIARES ADMIN =====
function scrollToPedidos() {
    const pedidosSection = document.getElementById('pedidosSection');
    if (pedidosSection) {
        pedidosSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function exportarDatos() {
    const data = {
        productos: productos,
        pedidos: pedidos,
        estadisticas: calculateStats(),
        negocioActual: negocioActual,
        fecha: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `negocio-vecino-slider-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Datos exportados correctamente', 'success');
}

function configurarNegocio() {
    showToast('Función en desarrollo', 'info');
}

function verAnalytics() {
    const analyticsSection = document.querySelector('.analytics-section');
    if (analyticsSection) {
        analyticsSection.style.display = analyticsSection.style.display === 'none' ? 'block' : 'none';
        showToast('Sección de analytics activada', 'info');
    }
}

function toggleAnalytics() {
    const analyticsSection = document.querySelector('.analytics-section');
    if (analyticsSection) {
        analyticsSection.style.display = 'none';
    }
}

// ===== MODALES Y UI =====
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
    
    resetModalState();
}

function resetModalState() {
    const formProducto = document.getElementById('formProducto');
    if (formProducto) {
        formProducto.reset();
    }
    
    document.getElementById('imagenPreview').innerHTML = '';
    currentEditingProduct = null;
    
    switchTab('resumen');
    
    const codigoInput = document.getElementById('codigoDescuento');
    const btnDescuento = document.querySelector('.btn-apply-discount');
    if (codigoInput) {
        codigoInput.disabled = false;
        codigoInput.value = '';
    }
    if (btnDescuento) {
        btnDescuento.disabled = false;
        btnDescuento.textContent = 'Aplicar';
    }
}

// ===== LOADING Y FEEDBACK =====
function showLoading(message = 'Cargando...') {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        const loadingText = loadingOverlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    loadingState = true;
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    loadingState = false;
}

// ===== SISTEMA DE NOTIFICACIONES TOAST MEJORADO =====
function showToast(message, type = 'info', duration = window.NegocioVecinoConfig.toastDuration) {
    if (!toastContainer) {
        console.warn('⚠️ toastContainer no encontrado, creando uno temporal');
        
        const tempContainer = document.createElement('div');
        tempContainer.className = 'toast-container';
        tempContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(tempContainer);
        
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const titles = {
        success: 'Éxito',
        error: 'Error',
        warning: 'Advertencia',
        info: 'Información'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titles[type] || 'Información'}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, duration);
}

// ===== UTILIDADES =====
function formatPrice(price) {
    return new Intl.NumberFormat('es-CL').format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== ERROR HANDLING MEJORADO =====
function handleDOMError(elementName, functionName) {
    console.error(`❌ Elemento '${elementName}' no encontrado en la función '${functionName}'`);
    showToast(`Error: Elemento ${elementName} no encontrado`, 'error');
}

window.addEventListener('error', (e) => {
    console.error('❌ Error global:', e.error);
    console.error('📍 Archivo:', e.filename);
    console.error('📍 Línea:', e.lineno);
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showToast('Error de JavaScript - Ver consola', 'error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promise rejection:', e.reason);
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showToast('Error de conexión - Ver consola', 'error');
    }
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perf = performance.getEntriesByType('navigation')[0];
            console.log(`📊 Página cargada en ${Math.round(perf.loadEventEnd - perf.loadEventStart)}ms`);
            console.log(`🎯 Sistema de slider: ${productos.length} productos con cantidades flexibles`);
        }, 0);
    });
}

// ===== FUNCIONES DE DEBUG Y DESARROLLO PARA SLIDER =====
function debugSliderSystem() {
    console.log('🔍 DEBUG - Sistema de Slider:');
    console.log('📦 Productos:', productos.length);
    
    productos.forEach(producto => {
        console.log(`📋 ${producto.nombre}:`);
        console.log(`   • Precio por ${producto.unidadMedida}: ${formatPrice(producto.precioUnidad)}`);
        console.log(`   • Rango: ${producto.cantidadMinima} - ${producto.cantidadMaxima}`);
        console.log(`   • Stock total: ${producto.stockTotal}`);
        console.log(`   • Ejemplo precio máximo: ${formatPrice(calcularPrecioTotal(producto, producto.cantidadMaxima))}`);
    });
    
    console.log('🛒 Carrito:', carrito.length, 'items');
    carrito.forEach(item => {
        console.log(`   • ${item.unidadFormateada} de ${item.nombre} = ${formatPrice(item.precioTotal)}`);
    });
}

function debugStock() {
    console.log('📊 DEBUG - Estado del Stock (Sistema Slider):');
    productos.forEach(producto => {
        const stockBajo = producto.stockTotal <= 5;
        const sinStock = producto.stockTotal === 0;
        
        console.log(`📦 ${producto.nombre}:`);
        console.log(`   • Stock disponible: ${producto.stockTotal}`);
        console.log(`   • Máximo posible: ${Math.min(producto.cantidadMaxima, producto.stockTotal)}`);
        
        if (sinStock) {
            console.log(`   ❌ Sin stock disponible`);
        } else if (stockBajo) {
            console.log(`   ⚠️ Stock bajo (${producto.stockTotal} unidades)`);
        }
    });
}

function simularVentasSlider() {
    console.log('🎲 Simulando ventas con sistema de slider...');
    
    const ventasSimuladas = [
        {
            productoId: 1,
            cantidad: 5, // 500g de pan
            cliente: 'Juan Pérez'
        },
        {
            productoId: 3,
            cantidad: 8, // 8 huevos
            cliente: 'María González'
        },
        {
            productoId: 2,
            cantidad: 6, // 1.5L de leche
            cliente: 'Carlos Mendoza'
        },
        {
            productoId: 4,
            cantidad: 12, // 600g de tomates
            cliente: 'Ana López'
        }
    ];
    
    ventasSimuladas.forEach(venta => {
        const producto = productos.find(p => p.id === venta.productoId);
        if (producto && verificarStock(producto, venta.cantidad)) {
            producto.stockTotal -= venta.cantidad;
            const unidadFormateada = formatearUnidad(producto, venta.cantidad);
            const precioTotal = calcularPrecioTotal(producto, venta.cantidad);
            console.log(`✅ Venta procesada: ${unidadFormateada} de ${producto.nombre} = ${formatPrice(precioTotal)} para ${venta.cliente}`);
        } else {
            console.log(`❌ Venta fallida: Stock insuficiente para ${venta.cantidad} unidades de producto ${venta.productoId}`);
        }
    });
    
    renderProductos();
    renderProductosAdmin();
    showToast('Ventas simuladas aplicadas al sistema de slider', 'info');
}

function resetearStockSlider() {
    console.log('🔄 Reseteando stock del sistema de slider...');
    
    const stockInicial = {
        1: 50,  // Pan
        2: 45,  // Leche
        3: 120, // Huevos
        4: 80,  // Tomates
        5: 30   // Queso
    };
    
    productos.forEach(producto => {
        if (stockInicial[producto.id]) {
            producto.stockTotal = stockInicial[producto.id];
            console.log(`📦 ${producto.nombre}: Stock reseteado a ${producto.stockTotal}`);
        }
    });
    
    renderProductos();
    renderProductosAdmin();
    showToast('Stock del sistema de slider reseteado', 'success');
}

// ===== FUNCIONES DE TESTING PARA SISTEMA DE SLIDER =====
function testSliderSystem() {
    console.log('🧪 Ejecutando tests del sistema de slider...');
    
    let tests = 0;
    let passed = 0;
    
    // Test 1: Verificar estructura de productos con slider
    tests++;
    const tieneEstructuraSlider = productos.every(p => 
        typeof p.precioUnidad === 'number' &&
        typeof p.cantidadMinima === 'number' &&
        typeof p.cantidadMaxima === 'number' &&
        typeof p.stockTotal === 'number' &&
        p.unidadMedida
    );
    if (tieneEstructuraSlider) {
        passed++;
        console.log('✅ Test 1: Todos los productos tienen estructura de slider');
    } else {
        console.log('❌ Test 1: Algunos productos no tienen estructura de slider completa');
    }
    
    // Test 2: Verificar cálculos de precio
    tests++;
    const producto1 = productos[0];
    const cantidad = 5;
    const precioCalculado = calcularPrecioTotal(producto1, cantidad);
    const precioEsperado = producto1.precioUnidad * cantidad;
    if (precioCalculado === precioEsperado) {
        passed++;
        console.log('✅ Test 2: Cálculo de precios funciona correctamente');
    } else {
        console.log('❌ Test 2: Error en cálculo de precios');
    }
    
    // Test 3: Verificar formateo de unidades
    tests++;
    const unidadFormateada = formatearUnidad(producto1, cantidad);
    if (unidadFormateada && unidadFormateada.includes(cantidad.toString())) {
        passed++;
        console.log('✅ Test 3: Formateo de unidades funciona');
    } else {
        console.log('❌ Test 3: Error en formateo de unidades');
    }
    
    // Test 4: Verificar verificación de stock
    tests++;
    const stockSuficiente = verificarStock(producto1, 1);
    const stockInsuficiente = verificarStock(producto1, 999999);
    if (stockSuficiente && !stockInsuficiente) {
        passed++;
        console.log('✅ Test 4: Verificación de stock funciona');
    } else {
        console.log('❌ Test 4: Error en verificación de stock');
    }
    
    // Test 5: Verificar rangos válidos
    tests++;
    const rangoValido = productos.every(p => 
        p.cantidadMinima > 0 &&
        p.cantidadMaxima >= p.cantidadMinima &&
        p.precioUnidad > 0
    );
    if (rangoValido) {
        passed++;
        console.log('✅ Test 5: Todos los rangos de productos son válidos');
    } else {
        console.log('❌ Test 5: Hay rangos de productos inválidos');
    }
    
    console.log(`📊 Resultados del sistema de slider: ${passed}/${tests} tests pasaron (${Math.round(passed/tests*100)}%)`);
    
    if (passed === tests) {
        showToast('✅ Todos los tests del slider pasaron', 'success');
    } else {
        showToast(`⚠️ ${tests - passed} tests del slider fallaron`, 'warning');
    }
}

// ===== FUNCIONES DE MIGRACIÓN Y COMPATIBILIDAD =====
function migrateToSliderSystem() {
    console.log('🔄 Verificando migración al sistema de slider...');
    
    let migrated = false;
    
    productos.forEach(producto => {
        // Si un producto tiene el sistema antiguo de variantes
        if (producto.variantes && !producto.precioUnidad) {
            console.log(`📦 Migrando producto al sistema de slider: ${producto.nombre}`);
            
            // Calcular valores promedio para el slider
            const precioPromedio = Math.round(
                producto.variantes.reduce((sum, v) => sum + v.precio, 0) / producto.variantes.length
            );
            const stockTotal = producto.variantes.reduce((sum, v) => sum + v.stock, 0);
            
            // Configurar sistema de slider
            producto.precioUnidad = precioPromedio;
            producto.unidadMedida = 'unidad';
            producto.cantidadMinima = 1;
            producto.cantidadMaxima = 50;
            producto.stockTotal = stockTotal;
            producto.incremento = 1;
            
            // Limpiar sistema antiguo
            delete producto.variantes;
            
            migrated = true;
        }
    });
    
    if (migrated) {
        console.log('✅ Migración al sistema de slider completada');
        showToast('Productos migrados al sistema de slider', 'info');
        renderProductos();
        renderProductosAdmin();
    }
}

// ===== FUNCIONES DE UTILIDAD ADICIONALES PARA SLIDER =====
function generarReporteSlider() {
    console.log('📊 Generando reporte del sistema de slider...');
    
    const reporte = {
        fecha: new Date().toISOString(),
        version: window.NegocioVecinoConfig.version,
        sistema: 'slider',
        productos: productos.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            activo: producto.activo,
            destacado: producto.destacado,
            precioUnidad: producto.precioUnidad,
            unidadMedida: producto.unidadMedida,
            cantidadMinima: producto.cantidadMinima,
            cantidadMaxima: producto.cantidadMaxima,
            stockTotal: producto.stockTotal,
            valorInventario: producto.precioUnidad * producto.stockTotal,
            flexibilidad: producto.cantidadMaxima - producto.cantidadMinima
        })),
        resumen: {
            totalProductos: productos.length,
            stockTotal: productos.reduce((total, p) => total + p.stockTotal, 0),
            valorTotalInventario: productos.reduce((total, p) => 
                total + (p.precioUnidad * p.stockTotal), 0
            ),
            precioPromedio: Math.round(
                productos.reduce((total, p) => total + p.precioUnidad, 0) / productos.length
            ),
            flexibilidadPromedio: Math.round(
                productos.reduce((total, p) => total + (p.cantidadMaxima - p.cantidadMinima), 0) / productos.length
            )
        },
        carrito: {
            items: carrito.length,
            valorTotal: carrito.reduce((total, item) => total + item.precioTotal, 0)
        }
    };
    
    console.log('📋 Reporte del sistema de slider generado:', reporte);
    return reporte;
}

function exportarReporteSlider() {
    const reporte = generarReporteSlider();
    
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-slider-system-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Reporte del sistema de slider exportado', 'success');
}

// ===== FUNCIONES DE OPTIMIZACIÓN DE SLIDER =====
function optimizarSliders() {
    console.log('⚡ Optimizando rendimiento de sliders...');
    
    // Throttle para updateSliderValue
    const throttledUpdate = throttle(updateSliderValue, 16); // 60 FPS
    
    // Aplicar throttling a todos los sliders existentes
    document.querySelectorAll('.cantidad-slider').forEach(slider => {
        const productoId = parseInt(slider.id.split('-')[1]);
        
        // Remover eventos anteriores
        slider.removeEventListener('input', updateSliderValue);
        slider.removeEventListener('change', updateSliderValue);
        
        // Agregar eventos optimizados
        slider.addEventListener('input', () => throttledUpdate(productoId));
        slider.addEventListener('change', () => updateSliderValue(productoId));
    });
    
    console.log('✅ Sliders optimizados para mejor rendimiento');
}

// ===== EVENTOS ESPECIALES PARA SISTEMA DE SLIDER =====
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('cantidad-slider')) {
        const productoId = parseInt(e.target.id.split('-')[1]);
        updateSliderValue(productoId);
    }
});

// ===== INICIALIZACIÓN FINAL Y DEBUG DEL SISTEMA SLIDER =====
function logSliderSystemInfo() {
    console.log(`🎚️ Negocio Vecino v${window.NegocioVecinoConfig.version} - Sistema de Slider cargado`);
    console.log('📊 Estado inicial del sistema de slider:');
    console.log(`   • Productos: ${productos.length}`);
    console.log(`   • Stock total: ${productos.reduce((total, p) => total + p.stockTotal, 0)} unidades`);
    console.log(`   • Valor total inventario: ${formatPrice(productos.reduce((total, p) => total + (p.precioUnidad * p.stockTotal), 0))}`);
    console.log(`   • Favoritos: ${favoritos.length}`);
    console.log(`   • Tema: ${currentTheme}`);
    console.log(`   • Negocio seleccionado: ${negocioActual ? negocioActual.nombre : 'Ninguno'}`);
    
    console.log('🎚️ Resumen del sistema de slider:');
    productos.forEach(producto => {
        const flexibilidad = producto.cantidadMaxima - producto.cantidadMinima;
        const valorMax = calcularPrecioTotal(producto, producto.cantidadMaxima);
        console.log(`   📦 ${producto.nombre}: Rango ${producto.cantidadMinima}-${producto.cantidadMaxima} | Stock: ${producto.stockTotal} | Precio máx: ${formatPrice(valorMax)}`);
    });
    
    console.log('🚀 ¡Sistema de slider listo para usar!');
    console.log('💡 Funciones de debug disponibles:');
    console.log('   • debugSliderSystem() - Ver info del sistema de slider');
    console.log('   • debugStock() - Ver estado del stock');
    console.log('   • testSliderSystem() - Ejecutar tests del slider');
    console.log('   • simularVentasSlider() - Simular ventas con slider');
    console.log('   • resetearStockSlider() - Restaurar stock inicial');
    console.log('   • generarReporteSlider() - Generar reporte del sistema');
    console.log('   • exportarReporteSlider() - Exportar reporte del sistema');
    console.log('   • optimizarSliders() - Optimizar rendimiento');
}

// Exponer funciones de debug globalmente para desarrollo
window.debugSliderSystem = debugSliderSystem;
window.debugStock = debugStock;
window.testSliderSystem = testSliderSystem;
window.simularVentasSlider = simularVentasSlider;
window.resetearStockSlider = resetearStockSlider;
window.generarReporteSlider = generarReporteSlider;
window.exportarReporteSlider = exportarReporteSlider;
window.optimizarSliders = optimizarSliders;
window.migrateToSliderSystem = migrateToSliderSystem;

// Exponer funciones principales para compatibilidad
window.updateSliderValue = updateSliderValue;
window.adjustSlider = adjustSlider;
window.addToCartWithSlider = addToCartWithSlider;

// Verificar elementos críticos al cargar
setTimeout(() => {
    logSliderSystemInfo();
    
    // Ejecutar migración automática si es necesario
    migrateToSliderSystem();
    
    // Ejecutar test automático en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Modo desarrollo detectado - Ejecutando tests automáticos del slider...');
        setTimeout(testSliderSystem, 2000);
        setTimeout(optimizarSliders, 3000);
    }
}, 1000);

console.log('🎚️ Sistema de Slider de Cantidades Flexibles cargado correctamente');
console.log('📝 Nuevas funciones disponibles en consola:');
console.log('   • debugSliderSystem() - Debug del sistema de slider');
console.log('   • testSliderSystem() - Tests del sistema de slider');
console.log('   • simularVentasSlider() - Simular ventas con cantidades flexibles');
console.log('   • resetearStockSlider() - Resetear stock del sistema');
console.log('   • generarReporteSlider() - Generar reporte completo');
console.log('   • exportarReporteSlider() - Exportar datos del sistema');
console.log('   • optimizarSliders() - Optimizar rendimiento');

} // Fin de protección contra carga múltiple