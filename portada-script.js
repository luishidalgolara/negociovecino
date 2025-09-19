// ===== DATOS DE EJEMPLO =====
const regionesData = {
    biobio: {
        name: "Región del Biobío",
        comunas: {
            concepcion: "Concepción",
            coronel: "Coronel",
            chiguayante: "Chiguayante",
            florida: "Florida",
            hualpen: "Hualpén",
            hualqui: "Hualqui",
            lota: "Lota",
            penco: "Penco",
            sanpedro: "San Pedro de la Paz",
            santajuana: "Santa Juana",
            talcahuano: "Talcahuano",
            tome: "Tomé"
        }
    }
};

let negociosData = [
    {
        id: 1,
        nombre: "Panadería Don Jesús",
        descripcion: "Panadería tradicional con más de 30 años sirviendo a la comunidad. Pan fresco todos los días.",
        categoria: "panaderia",
        comuna: "concepcion",
        direccion: "Av. Libertador Bernardo O'Higgins 1234",
        telefono: "+56 9 1234 5678",
        horario: "Lun-Sáb: 6:00-20:00, Dom: 7:00-15:00",
        estado: "open",
        rating: 4.8,
        reviews: 127,
        imagen: null,
        tags: ["pan artesanal", "empanadas", "tortas"],
        destacado: true
    },
    {
        id: 2,
        nombre: "Supermercado Familia",
        descripcion: "Todo lo que necesitas para tu hogar. Productos frescos y precios justos.",
        categoria: "supermercado",
        comuna: "concepcion",
        direccion: "Calle Maipú 567",
        telefono: "+56 9 2345 6789",
        horario: "Lun-Dom: 8:00-22:00",
        estado: "open",
        rating: 4.5,
        reviews: 203,
        imagen: null,
        tags: ["abarrotes", "lacteos", "carnes", "verduras"],
        destacado: false
    },
    {
        id: 3,
        nombre: "Farmacia Cruz Verde San Pedro",
        descripcion: "Farmacia de barrio con atención personalizada y productos de calidad.",
        categoria: "farmacia",
        comuna: "sanpedro",
        direccion: "Av. Padre Hurtado 890",
        telefono: "+56 9 3456 7890",
        horario: "Lun-Vie: 8:30-20:00, Sáb: 9:00-18:00",
        estado: "open",
        rating: 4.7,
        reviews: 89,
        imagen: null,
        tags: ["medicamentos", "cosmética", "cuidado personal"],
        destacado: false
    },
    {
        id: 4,
        nombre: "Verdulería El Huerto",
        descripcion: "Frutas y verduras frescas directo del campo. Calidad garantizada.",
        categoria: "verduleria",
        comuna: "concepcion",
        direccion: "Calle Angol 123",
        telefono: "+56 9 4567 8901",
        horario: "Lun-Sáb: 7:00-19:00",
        estado: "open",
        rating: 4.6,
        reviews: 156,
        imagen: null,
        tags: ["frutas", "verduras", "orgánico"],
        destacado: true
    },
    {
        id: 5,
        nombre: "Carnicería Los Primos",
        descripcion: "Carnes frescas y embutidos artesanales. Tradición familiar de 3 generaciones.",
        categoria: "carniceria",
        comuna: "sanpedro",
        direccion: "Av. Andalién 456",
        telefono: "+56 9 5678 9012",
        horario: "Mar-Sáb: 8:00-19:00, Dom: 9:00-14:00",
        estado: "closed",
        rating: 4.9,
        reviews: 78,
        imagen: null,
        tags: ["carnes", "embutidos", "pollo"],
        destacado: false
    },
    {
        id: 6,
        nombre: "Minimercado Mil",
        descripcion: "Panes artesanales, pastelería fina y café de especialidad.",
        categoria: "panaderia",
        comuna: "sanpedro",
        direccion: " Cangrejeras 1487, B, San Pedro de la Paz, Bío Bío",
        telefono: "+56 9 6789 0123",
        horario: "Lun-Vie: 7:00-19:00, Sáb-Dom: 8:00-17:00",
        estado: "open",
        rating: 4.8,
        reviews: 94,
        imagen: null,
        tags: ["artesanal", "café", "repostería"],
        destacado: true
    }
];

// ===== ESTADO DE LA APLICACIÓN =====
let currentComuna = null;
let filteredStores = [];
let currentView = 'grid'; // Nueva variable para la vista actual

// ===== ELEMENTOS DEL DOM =====
const regionSelect = document.getElementById('regionSelect');
const comunaSelect = document.getElementById('comunaSelect');
const findStoresBtn = document.getElementById('findStoresBtn');
const searchFilters = document.getElementById('searchFilters');
const searchInput = document.getElementById('searchInput');
const storesGrid = document.getElementById('storesGrid');
const emptyState = document.getElementById('emptyState');
const currentLocation = document.getElementById('currentLocation');
const storesTitle = document.getElementById('storesTitle');
const themeToggle = document.getElementById('themeToggle');
const filterTags = document.querySelectorAll('.filter-tag');
const viewBtns = document.querySelectorAll('.view-btn'); // Nuevos botones de vista

// ===== FUNCIONES DE INICIALIZACIÓN =====
function initializeApp() {
    setupEventListeners();
    loadTheme();
    loadStoredImages();
    loadPreferredView(); // Cargar la vista preferida del usuario
}

function setupEventListeners() {
    regionSelect.addEventListener('change', handleRegionChange);
    findStoresBtn.addEventListener('click', handleFindStores);
    searchInput.addEventListener('input', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => handleFilterChange(tag));
    });

    // Nuevos event listeners para los botones de vista
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => handleViewChange(btn));
    });
}

// ===== MANEJO DE VISTAS =====
function handleViewChange(clickedBtn) {
    // Remover active de todos los botones
    viewBtns.forEach(btn => btn.classList.remove('active'));
    
    // Agregar active al botón clickeado
    clickedBtn.classList.add('active');
    
    // Actualizar la vista actual
    currentView = clickedBtn.dataset.view;
    
    // Re-renderizar las tarjetas para la nueva vista
    if (filteredStores.length > 0) {
        displayStores(filteredStores);
    }
    
    // Guardar preferencia
    localStorage.setItem('preferredView', currentView);
}

function applyCurrentView() {
    // Remover todas las clases de vista
    storesGrid.classList.remove('list-view', 'compact-view');
    
    // Aplicar la clase de vista actual
    if (currentView === 'list') {
        storesGrid.classList.add('list-view');
    } else if (currentView === 'compact') {
        storesGrid.classList.add('compact-view');
    }
}

function loadPreferredView() {
    const savedView = localStorage.getItem('preferredView') || 'grid';
    currentView = savedView;
    
    // Actualizar botón activo
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === savedView) {
            btn.classList.add('active');
        }
    });
    
    // Aplicar vista si hay tiendas cargadas
    if (filteredStores.length > 0) {
        applyCurrentView();
    }
}

// ===== NUEVA FUNCIONALIDAD DE SUBIDA DE IMÁGENES =====
function createImageUploadInput(storeId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'image-file-input';
    input.onchange = (e) => handleImageUpload(e, storeId);
    return input;
}

function handleImageUpload(event, storeId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        showToast('Por favor selecciona solo archivos de imagen', 'error');
        return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen es muy grande. Máximo 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Actualizar el negocio con la nueva imagen
        const storeIndex = negociosData.findIndex(store => store.id === storeId);
        if (storeIndex !== -1) {
            negociosData[storeIndex].imagen = imageData;
            
            // Guardar en localStorage para persistencia
            saveImageToStorage(storeId, imageData);
            
            // Actualizar la visualización
            updateStoreImage(storeId, imageData);
            
            showToast('Imagen actualizada correctamente', 'success');
        }
    };
    
    reader.readAsDataURL(file);
}

function updateStoreImage(storeId, imageData) {
    const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
    if (storeCard) {
        const imageContainer = storeCard.querySelector('.store-image');
        imageContainer.innerHTML = `
            <img src="${imageData}" alt="Imagen del local">
            <div class="store-status ${getStoreById(storeId).estado}">
                ${getStoreById(storeId).estado === 'open' ? 'Abierto' : 'Cerrado'}
            </div>
            <div class="image-upload-overlay">
                <i class="fas fa-camera"></i>
                <div class="upload-text">Cambiar imagen</div>
            </div>
        `;
    }
}

function saveImageToStorage(storeId, imageData) {
    try {
        localStorage.setItem(`store_image_${storeId}`, imageData);
    } catch (error) {
        console.warn('No se pudo guardar la imagen en localStorage:', error);
    }
}

function loadStoredImages() {
    negociosData.forEach(store => {
        try {
            const storedImage = localStorage.getItem(`store_image_${store.id}`);
            if (storedImage) {
                store.imagen = storedImage;
            }
        } catch (error) {
            console.warn('Error cargando imagen almacenada:', error);
        }
    });
}

function getStoreById(storeId) {
    return negociosData.find(store => store.id === storeId);
}

// ===== MANEJO DE REGIONES Y COMUNAS =====
function handleRegionChange() {
    const selectedRegion = regionSelect.value;
    
    if (selectedRegion && regionesData[selectedRegion]) {
        populateComunaSelect(regionesData[selectedRegion].comunas);
        comunaSelect.disabled = false;
    } else {
        comunaSelect.innerHTML = '<option value="">Primero selecciona una región</option>';
        comunaSelect.disabled = true;
    }
}

function populateComunaSelect(comunas) {
    comunaSelect.innerHTML = '<option value="">Selecciona una comuna</option>';
    
    Object.entries(comunas).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value;
        comunaSelect.appendChild(option);
    });
}

// ===== BÚSQUEDA DE NEGOCIOS =====
function handleFindStores() {
    const selectedRegion = regionSelect.value;
    const selectedComuna = comunaSelect.value;
    
    if (!selectedRegion || !selectedComuna) {
        showToast('Por favor selecciona región y comuna', 'warning');
        return;
    }
    
    currentComuna = selectedComuna;
    updateLocationIndicator(selectedRegion, selectedComuna);
    loadStores();
    showSearchFilters();
}

function updateLocationIndicator(region, comuna) {
    const regionName = regionesData[region].name;
    const comunaName = regionesData[region].comunas[comuna];
    currentLocation.textContent = `${comunaName}, ${regionName}`;
}

function showSearchFilters() {
    searchFilters.style.display = 'block';
    searchFilters.scrollIntoView({ behavior: 'smooth' });
}

// ===== CARGA Y FILTRADO DE NEGOCIOS =====
function loadStores() {
    filteredStores = negociosData.filter(negocio => negocio.comuna === currentComuna);
    displayStores(filteredStores);
    updateStoresTitle();
}

function displayStores(stores) {
    if (stores.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    storesGrid.innerHTML = stores.map(store => createStoreCard(store)).join('');
    
    // Aplicar la vista actual después de cargar las tiendas
    applyCurrentView();
    
    attachStoreEventListeners();
}

function createStoreCard(store) {
    const starsHtml = createStarsHTML(store.rating);
    const tagsHtml = store.tags.map(tag => `<span class="store-tag">${tag}</span>`).join('');
    
    // Generar overlay de imagen basado en si tiene imagen o no
    const imageOverlay = store.imagen ? 
        `<div class="image-upload-overlay">
            <i class="fas fa-camera"></i>
            <div class="upload-text">Cambiar imagen</div>
            <div class="image-actions">
                <button class="btn-image-action" onclick="event.stopPropagation(); triggerImageUpload(${store.id})">
                    <i class="fas fa-upload"></i>
                    Cambiar
                </button>
                <button class="btn-image-action btn-delete-image" onclick="event.stopPropagation(); deleteStoreImage(${store.id})">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>` :
        `<div class="image-upload-overlay">
            <i class="fas fa-camera"></i>
            <div class="upload-text">Subir imagen</div>
        </div>`;

    // Estructura base para vista compacta
    if (currentView === 'compact') {
        return `
            <div class="store-card" data-store-id="${store.id}">
                <div class="store-image" onclick="triggerImageUpload(${store.id})">
                    ${store.imagen ? 
                        `<img src="${store.imagen}" alt="${store.nombre}">` : 
                        '<i class="fas fa-store"></i>'
                    }
                    ${imageOverlay}
                </div>
                <div class="store-info">
                    <div class="store-main-info">
                        <h3 class="store-name">${store.nombre}</h3>
                        <p class="store-description">${store.descripcion}</p>
                        <div class="store-rating">
                            ${starsHtml}
                            <span>${store.rating}</span>
                            <span>(${store.reviews})</span>
                        </div>
                    </div>
                    <div class="store-meta">
                        <div class="store-status ${store.estado}">
                            ${store.estado === 'open' ? 'Abierto' : 'Cerrado'}
                        </div>
                    </div>
                    <div class="store-actions">
                        <button class="btn-view-store" onclick="viewStore(${store.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Ver Tienda
                        </button>
                        <button class="btn-favorite" onclick="toggleFavorite(${store.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Estructura para vistas grid y lista (similar layout)
    return `
        <div class="store-card" data-store-id="${store.id}">
            <div class="store-image" onclick="triggerImageUpload(${store.id})">
                ${store.imagen ? 
                    `<img src="${store.imagen}" alt="${store.nombre}">` : 
                    '<i class="fas fa-store"></i>'
                }
                <div class="store-status ${store.estado}">
                    ${store.estado === 'open' ? 'Abierto' : 'Cerrado'}
                </div>
                ${imageOverlay}
            </div>
            <div class="store-info">
                <div class="store-header">
                    <div>
                        <h3 class="store-name">${store.nombre}</h3>
                        <div class="store-rating">
                            ${starsHtml}
                            <span>${store.rating}</span>
                            <span>(${store.reviews})</span>
                        </div>
                    </div>
                </div>
                <p class="store-description">${store.descripcion}</p>
                <div class="store-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${store.direccion}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${store.horario}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${store.telefono}</span>
                    </div>
                </div>
                <div class="store-tags">
                    ${tagsHtml}
                </div>
                <div class="store-actions">
                    <button class="btn-view-store" onclick="viewStore(${store.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Ver Tienda
                    </button>
                    <button class="btn-favorite" onclick="toggleFavorite(${store.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function triggerImageUpload(storeId) {
    // Crear y activar input de archivo
    const input = createImageUploadInput(storeId);
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

function deleteStoreImage(storeId) {
    // Confirmar antes de eliminar
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
        return;
    }

    // Actualizar el negocio removiendo la imagen
    const storeIndex = negociosData.findIndex(store => store.id === storeId);
    if (storeIndex !== -1) {
        negociosData[storeIndex].imagen = null;
        
        // Remover de localStorage
        removeImageFromStorage(storeId);
        
        // Actualizar la visualización
        resetStoreImage(storeId);
        
        showToast('Imagen eliminada correctamente', 'success');
    }
}

function resetStoreImage(storeId) {
    const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
    if (storeCard) {
        const imageContainer = storeCard.querySelector('.store-image');
        imageContainer.innerHTML = `
            <i class="fas fa-store"></i>
            <div class="store-status ${getStoreById(storeId).estado}">
                ${getStoreById(storeId).estado === 'open' ? 'Abierto' : 'Cerrado'}
            </div>
            <div class="image-upload-overlay">
                <i class="fas fa-camera"></i>
                <div class="upload-text">Subir imagen</div>
            </div>
        `;
    }
}

function removeImageFromStorage(storeId) {
    try {
        localStorage.removeItem(`store_image_${storeId}`);
    } catch (error) {
        console.warn('No se pudo eliminar la imagen de localStorage:', error);
    }
}

function createStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    return starsHTML;
}

function attachStoreEventListeners() {
    // Los event listeners se manejan con onclick en el HTML para simplificar
}

// ===== FUNCIONES DE INTERACCIÓN =====
// **FUNCIÓN MODIFICADA PRINCIPAL** 
function viewStore(storeId) {
    // Buscar la información del negocio seleccionado
    const negocio = negociosData.find(store => store.id === storeId);
    
    if (!negocio) {
        console.error('Negocio no encontrado:', storeId);
        showToast('Error: No se pudo encontrar la información del negocio', 'error');
        return;
    }
    
    // Guardar información del negocio en localStorage para persistencia
    const negocioInfo = {
        id: negocio.id,
        nombre: negocio.nombre,
        descripcion: negocio.descripcion,
        categoria: negocio.categoria,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        horario: negocio.horario,
        rating: negocio.rating,
        reviews: negocio.reviews
    };
    
    try {
        localStorage.setItem('negocioSeleccionado', JSON.stringify(negocioInfo));
        console.log('✅ Información del negocio guardada:', negocioInfo);
    } catch (error) {
        console.warn('⚠️ No se pudo guardar en localStorage:', error);
    }
    
    // Redirigir a negocio-index.html con parámetros en la URL como respaldo
    const params = new URLSearchParams({
        storeId: negocio.id,
        storeName: negocio.nombre,
        storeCategory: negocio.categoria
    });
    
    // Mostrar feedback al usuario
    showToast(`Accediendo a ${negocio.nombre}...`, 'info');
    
    // Pequeño delay para que el usuario vea el feedback
    setTimeout(() => {
        window.location.href = `negocio-index.html?${params.toString()}`;
    }, 800);
}

function toggleFavorite(storeId) {
    const btn = event.target.closest('.btn-favorite');
    btn.classList.toggle('active');
    
    const action = btn.classList.contains('active') ? 'agregado a' : 'removido de';
    showToast(`Negocio ${action} favoritos`, 'success');
}

// ===== BÚSQUEDA Y FILTROS =====
function handleSearch() {
    displayStores(getFilteredStores());
}

function handleFilterChange(clickedTag) {
    // Remover active de todos los tags
    filterTags.forEach(tag => tag.classList.remove('active'));
    
    // Agregar active al tag clickeado
    clickedTag.classList.add('active');
    
    // Ejecutar búsqueda con nuevo filtro
    handleSearch();
}

function getFilteredStores() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-tag.active').dataset.category;
    
    return filteredStores.filter(store => {
        const matchesSearch = store.nombre.toLowerCase().includes(searchTerm) ||
                            store.descripcion.toLowerCase().includes(searchTerm) ||
                            store.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesCategory = activeCategory === 'all' || store.categoria === activeCategory;
        
        return matchesSearch && matchesCategory;
    });
}

// ===== UTILIDADES =====
function showEmptyState() {
    storesGrid.style.display = 'none';
    emptyState.style.display = 'block';
}

function hideEmptyState() {
    storesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
}

function updateStoresTitle() {
    const comunaName = regionesData.biobio.comunas[currentComuna];
    storesTitle.textContent = `Negocios en ${comunaName}`;
}

function showToast(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${getToastIcon(type)}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check',
        error: 'fa-exclamation-triangle',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };
    return icons[type] || icons.info;
}

// ===== TEMA OSCURO/CLARO =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizar icono
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initializeApp);