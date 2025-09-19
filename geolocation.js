// ===== SISTEMA DE GEOLOCALIZACIÓN PARA NEGOCIO VECINO =====
// Archivo independiente para manejo de ubicación y filtrado geográfico
// Versión: 1.0.0

// ===== PROTECCIÓN CONTRA CARGA MÚLTIPLE =====
if (window.NegocioVecinoGeolocation) {
    console.warn('⚠️ Sistema de Geolocalización ya está cargado');
} else {
    window.NegocioVecinoGeolocation = true;

// ===== CONFIGURACIÓN PRINCIPAL =====
const GeoConfig = {
    version: '1.0.0',
    defaultRadius: 5, // kilómetros
    maxRadius: 50, // kilómetros máximo
    timeout: 10000, // 10 segundos para obtener ubicación
    enableHighAccuracy: true,
    maximumAge: 300000, // 5 minutos de cache de ubicación
    
    // Configuraciones por región
    regiones: {
        biobio: {
            nombre: 'Región del Biobío',
            center: { lat: -36.8270, lng: -73.0440 }, // Concepción
            comunas: [
                'Concepción', 'Talcahuano', 'Hualpén', 'Chiguayante', 
                'San Pedro de la Paz', 'Penco', 'Tomé', 'Florida',
                'Hualqui', 'Coronel', 'Lota', 'Santa Juana'
            ],
            defaultRadius: 5
        }
        // Futuras regiones se pueden agregar aquí
    },
    
    // Configuración de errores
    errorMessages: {
        PERMISSION_DENIED: 'Acceso a ubicación denegado. Por favor, permite el acceso para ver negocios cercanos.',
        POSITION_UNAVAILABLE: 'No se pudo determinar tu ubicación. Revisa tu conexión GPS.',
        TIMEOUT: 'Tiempo agotado para obtener ubicación. Intenta nuevamente.',
        NETWORK_ERROR: 'Error de red. Verifica tu conexión a internet.',
        NO_BUSINESSES_FOUND: 'No hay negocios disponibles en tu área.',
        UNSUPPORTED_BROWSER: 'Tu navegador no soporta geolocalización.'
    }
};

// ===== BASE DE DATOS DE NEGOCIOS =====
// Datos de negocios reales en la región del Biobío
const negociosDatabase = [
    {
        id: 'neg_001',
        nombre: 'Almacén Doña María',
        descripcion: 'Almacén familiar con productos frescos y de primera necesidad',
        direccion: 'Calle Barros Arana 1234, Concepción',
        comuna: 'Concepción',
        coordenadas: {
            lat: -36.8201,
            lng: -73.0444
        },
        telefono: '+56 9 8765 4321',
        horarios: {
            lunes: '08:00-21:00',
            martes: '08:00-21:00', 
            miercoles: '08:00-21:00',
            jueves: '08:00-21:00',
            viernes: '08:00-22:00',
            sabado: '08:00-22:00',
            domingo: '09:00-20:00'
        },
        categoria: 'almacen',
        rating: 4.5,
        productosDisponibles: [1, 2, 3, 4, 5], // IDs que coinciden con script.js
        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e67e22" width="100" height="100"/%3E%3Ctext y="50" x="50" text-anchor="middle" dy=".3em" font-size="40"%3E🏪%3C/text%3E%3C/svg%3E',
        activo: true,
        fechaRegistro: '2024-01-15'
    },
    {
        id: 'neg_002',
        nombre: 'Panadería San Pedro',
        descripcion: 'Panadería artesanal con más de 20 años de tradición',
        direccion: 'Av. San Pedro 567, San Pedro de la Paz',
        comuna: 'San Pedro de la Paz',
        coordenadas: {
            lat: -36.8403,
            lng: -73.1134
        },
        telefono: '+56 9 7654 3210',
        horarios: {
            lunes: '06:00-20:00',
            martes: '06:00-20:00',
            miercoles: '06:00-20:00', 
            jueves: '06:00-20:00',
            viernes: '06:00-21:00',
            sabado: '06:00-21:00',
            domingo: '07:00-19:00'
        },
        categoria: 'panaderia',
        rating: 4.8,
        productosDisponibles: [1], // Solo productos de panadería
        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23d4a574" width="100" height="100"/%3E%3Ctext y="50" x="50" text-anchor="middle" dy=".3em" font-size="40"%3E🥖%3C/text%3E%3C/svg%3E',
        activo: true,
        fechaRegistro: '2024-01-10'
    },
    {
        id: 'neg_003',
        nombre: 'Minimarket Los Andes',
        descripcion: 'Minimarket 24/7 con gran variedad de productos',
        direccion: 'Los Andes 890, Talcahuano',
        comuna: 'Talcahuano',
        coordenadas: {
            lat: -36.7312,
            lng: -73.1161
        },
        telefono: '+56 9 5432 1098',
        horarios: {
            lunes: '24 horas',
            martes: '24 horas',
            miercoles: '24 horas',
            jueves: '24 horas', 
            viernes: '24 horas',
            sabado: '24 horas',
            domingo: '24 horas'
        },
        categoria: 'minimarket',
        rating: 4.2,
        productosDisponibles: [1, 2, 3, 4, 5],
        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%2327ae60" width="100" height="100"/%3E%3Ctext y="50" x="50" text-anchor="middle" dy=".3em" font-size="40"%3E🏬%3C/text%3E%3C/svg%3E',
        activo: true,
        fechaRegistro: '2024-01-08'
    },
    {
        id: 'neg_004',
        nombre: 'Verdulería Fresh',
        descripcion: 'Verduras y frutas frescas directo del productor',
        direccion: 'Calle Las Flores 234, Hualpén',
        comuna: 'Hualpén',
        coordenadas: {
            lat: -36.7923,
            lng: -73.1621
        },
        telefono: '+56 9 3210 9876',
        horarios: {
            lunes: '07:00-19:00',
            martes: '07:00-19:00',
            miercoles: '07:00-19:00',
            jueves: '07:00-19:00',
            viernes: '07:00-20:00',
            sabado: '07:00-20:00',
            domingo: '08:00-18:00'
        },
        categoria: 'verduleria',
        rating: 4.6,
        productosDisponibles: [4], // Solo verduras
        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%2327ae60" width="100" height="100"/%3E%3Ctext y="50" x="50" text-anchor="middle" dy=".3em" font-size="40"%3E🥬%3C/text%3E%3C/svg%3E',
        activo: true,
        fechaRegistro: '2024-01-12'
    },
    {
        id: 'neg_005',
        nombre: 'Lácteos del Sur',
        descripcion: 'Productos lácteos frescos y artesanales',
        direccion: 'Av. Collao 456, Concepción',
        comuna: 'Concepción',
        coordenadas: {
            lat: -36.8391,
            lng: -73.0524
        },
        telefono: '+56 9 1098 7654',
        horarios: {
            lunes: '08:00-18:00',
            martes: '08:00-18:00',
            miercoles: '08:00-18:00',
            jueves: '08:00-18:00',
            viernes: '08:00-19:00',
            sabado: '08:00-19:00',
            domingo: 'Cerrado'
        },
        categoria: 'lacteos',
        rating: 4.4,
        productosDisponibles: [2, 5], // Leche y queso
        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23ffffff" width="100" height="100"/%3E%3Ctext y="50" x="50" text-anchor="middle" dy=".3em" font-size="40"%3E🥛%3C/text%3E%3C/svg%3E',
        activo: true,
        fechaRegistro: '2024-01-05'
    },
    {
        id: 'neg_006',
        nombre: 'Almacén Central',
        descripcion: 'Almacén céntrico con delivery rápido',
        direccion: 'Plaza de Armas 123, Concepción',
        comuna: 'Concepción',
        coordenadas: {
            lat: -36.8270,
            lng: -73.0440
        },
        telefono: '+56 9 9876 5432',
        horarios: {
            lunes: '09:00-21:00',
            martes: '09:00-21:00',
            miercoles: '09:00-21:00',
            jueves: '09:00-21:00',
            viernes: '09:00-22:00',
            sabado: '09:00-22:00',
            domingo: '10:00-20:00'
        },
        categoria: 'almacen',
        rating: 4.3,
        productosDisponibles: [1, 2, 3, 4, 5],
        imagen: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f39c12" width="100" height="100"/%3E%3Ctext y="50" x="50" text-anchor="middle" dy=".3em" font-size="40"%3E🏪%3C/text%3E%3C/svg%3E',
        activo: true,
        fechaRegistro: '2024-01-01'
    }
];

// ===== VARIABLES DE ESTADO =====
let userLocation = null;
let currentRegion = 'biobio';
let negociosCercanos = [];
let lastLocationUpdate = null;
let watchPositionId = null;
let isGeolocationSupported = false;
let pendingLocationRequest = false;

// ===== FUNCIONES CORE DE GEOLOCALIZACIÓN =====

/**
 * Verifica si el navegador soporta geolocalización
 */
function checkGeolocationSupport() {
    isGeolocationSupported = 'geolocation' in navigator;
    
    if (!isGeolocationSupported) {
        console.warn('⚠️ Geolocalización no soportada en este navegador');
        showLocationError('UNSUPPORTED_BROWSER');
        return false;
    }
    
    console.log('✅ Geolocalización soportada');
    return true;
}

/**
 * Obtiene la ubicación actual del usuario
 */
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!checkGeolocationSupport()) {
            reject(new Error('UNSUPPORTED_BROWSER'));
            return;
        }

        if (pendingLocationRequest) {
            console.log('🔄 Solicitud de ubicación ya en progreso...');
            return;
        }

        pendingLocationRequest = true;
        console.log('📍 Solicitando ubicación del usuario...');

        const options = {
            enableHighAccuracy: GeoConfig.enableHighAccuracy,
            timeout: GeoConfig.timeout,
            maximumAge: GeoConfig.maximumAge
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                pendingLocationRequest = false;
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().getTime()
                };
                
                userLocation = location;
                lastLocationUpdate = location.timestamp;
                
                console.log('✅ Ubicación obtenida:', {
                    lat: location.lat.toFixed(6),
                    lng: location.lng.toFixed(6),
                    accuracy: `${Math.round(location.accuracy)}m`
                });
                
                resolve(location);
            },
            (error) => {
                pendingLocationRequest = false;
                console.error('❌ Error obteniendo ubicación:', error);
                
                let errorType;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorType = 'PERMISSION_DENIED';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorType = 'POSITION_UNAVAILABLE';
                        break;
                    case error.TIMEOUT:
                        errorType = 'TIMEOUT';
                        break;
                    default:
                        errorType = 'NETWORK_ERROR';
                }
                
                showLocationError(errorType);
                reject(new Error(errorType));
            },
            options
        );
    });
}

/**
 * Inicia el seguimiento continuo de ubicación
 */
function startLocationWatching() {
    if (!checkGeolocationSupport()) return;

    if (watchPositionId) {
        console.log('👁️ Ya hay seguimiento de ubicación activo');
        return;
    }

    const options = {
        enableHighAccuracy: GeoConfig.enableHighAccuracy,
        timeout: GeoConfig.timeout,
        maximumAge: GeoConfig.maximumAge
    };

    watchPositionId = navigator.geolocation.watchPosition(
        (position) => {
            const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().getTime()
            };

            // Solo actualizar si ha cambiado significativamente
            if (!userLocation || calculateDistance(userLocation, newLocation) > 0.1) {
                userLocation = newLocation;
                lastLocationUpdate = newLocation.timestamp;
                
                console.log('📍 Ubicación actualizada:', {
                    lat: newLocation.lat.toFixed(6),
                    lng: newLocation.lng.toFixed(6)
                });
                
                // Actualizar negocios cercanos automáticamente
                updateNearbyBusinesses();
            }
        },
        (error) => {
            console.warn('⚠️ Error en seguimiento de ubicación:', error);
        },
        options
    );

    console.log('👁️ Seguimiento de ubicación iniciado');
}

/**
 * Detiene el seguimiento de ubicación
 */
function stopLocationWatching() {
    if (watchPositionId) {
        navigator.geolocation.clearWatch(watchPositionId);
        watchPositionId = null;
        console.log('🛑 Seguimiento de ubicación detenido');
    }
}

// ===== FUNCIONES DE CÁLCULO DE DISTANCIA =====

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distancia en kilómetros
 */
function calculateDistance(point1, point2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
}

/**
 * Convierte grados a radianes
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calcula el tiempo estimado de delivery basado en la distancia
 * @param {number} distance - Distancia en kilómetros
 * @returns {string} Tiempo estimado en formato legible
 */
function calculateDeliveryTime(distance) {
    if (distance <= 1) return '15-20 min';
    if (distance <= 3) return '20-30 min';
    if (distance <= 5) return '30-45 min';
    if (distance <= 10) return '45-60 min';
    return '60+ min';
}

// ===== FUNCIONES DE FILTRADO =====

/**
 * Filtra negocios por radio de distancia
 * @param {number} radius - Radio en kilómetros
 * @param {Object} userPos - Posición del usuario {lat, lng}
 * @returns {Array} Negocios filtrados con distancia agregada
 */
function filterBusinessesByRadius(radius = GeoConfig.defaultRadius, userPos = userLocation) {
    if (!userPos) {
        console.warn('⚠️ No hay ubicación del usuario para filtrar');
        return [];
    }

    const filteredBusinesses = negociosDatabase
        .filter(negocio => negocio.activo)
        .map(negocio => {
            const distance = calculateDistance(userPos, negocio.coordenadas);
            return {
                ...negocio,
                distance: distance,
                deliveryTime: calculateDeliveryTime(distance)
            };
        })
        .filter(negocio => negocio.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

    console.log(`🔍 Encontrados ${filteredBusinesses.length} negocios dentro de ${radius}km`);
    
    return filteredBusinesses;
}

/**
 * Filtra negocios por comuna
 * @param {string} comuna - Nombre de la comuna
 * @returns {Array} Negocios en la comuna especificada
 */
function filterBusinessesByComuna(comuna) {
    const filteredBusinesses = negociosDatabase
        .filter(negocio => 
            negocio.activo && 
            negocio.comuna.toLowerCase() === comuna.toLowerCase()
        )
        .map(negocio => {
            if (userLocation) {
                const distance = calculateDistance(userLocation, negocio.coordenadas);
                return {
                    ...negocio,
                    distance: distance,
                    deliveryTime: calculateDeliveryTime(distance)
                };
            }
            return negocio;
        })
        .sort((a, b) => {
            if (a.distance && b.distance) {
                return a.distance - b.distance;
            }
            return 0;
        });

    console.log(`🏘️ Encontrados ${filteredBusinesses.length} negocios en ${comuna}`);
    
    return filteredBusinesses;
}

/**
 * Filtra negocios por categoría y ubicación
 * @param {string} categoria - Categoría del negocio
 * @param {number} radius - Radio en kilómetros
 * @returns {Array} Negocios filtrados
 */
function filterBusinessesByCategory(categoria, radius = GeoConfig.defaultRadius) {
    const businessesByLocation = filterBusinessesByRadius(radius);
    
    if (categoria === 'all') {
        return businessesByLocation;
    }
    
    const filtered = businessesByLocation.filter(negocio => 
        negocio.categoria === categoria
    );
    
    console.log(`🏷️ Encontrados ${filtered.length} negocios de categoría "${categoria}"`);
    
    return filtered;
}

// ===== FUNCIONES DE DETECTAR UBICACIÓN AUTOMÁTICA =====

/**
 * Detecta la comuna del usuario basada en sus coordenadas
 * @param {Object} location - {lat, lng}
 * @returns {string} Nombre de la comuna detectada
 */
function detectUserComuna(location = userLocation) {
    if (!location) return null;

    // Buscar el negocio más cercano para inferir la comuna
    let closestBusiness = null;
    let minDistance = Infinity;
    
    negociosDatabase.forEach(negocio => {
        const distance = calculateDistance(location, negocio.coordenadas);
        if (distance < minDistance) {
            minDistance = distance;
            closestBusiness = negocio;
        }
    });
    
    if (closestBusiness && minDistance <= 10) { // 10km máximo
        console.log(`📍 Comuna detectada: ${closestBusiness.comuna} (${minDistance.toFixed(2)}km del negocio más cercano)`);
        return closestBusiness.comuna;
    }
    
    // Fallback: usar centro de región
    console.log('📍 Usando ubicación por defecto: Concepción');
    return 'Concepción';
}

// ===== FUNCIONES DE INTEGRACIÓN CON PRODUCTOS =====

/**
 * Obtiene productos disponibles en negocios locales
 * @param {Array} negociosLocal - Lista de negocios cercanos
 * @returns {Array} IDs de productos disponibles localmente
 */
function getLocalProducts(negociosLocal = negociosCercanos) {
    const productIds = new Set();
    
    negociosLocal.forEach(negocio => {
        if (negocio.productosDisponibles) {
            negocio.productosDisponibles.forEach(id => productIds.add(id));
        }
    });
    
    const localProductIds = Array.from(productIds);
    console.log(`🛍️ Productos disponibles localmente: ${localProductIds.length}`);
    
    return localProductIds;
}

/**
 * Enriquece información de productos con datos de negocios locales
 * @param {Array} productos - Lista de productos del sistema principal
 * @returns {Array} Productos enriquecidos con información local
 */
function enrichProductsWithLocalInfo(productos) {
    return productos.map(producto => {
        const negociosQueLoVenden = negociosCercanos.filter(negocio => 
            negocio.productosDisponibles && 
            negocio.productosDisponibles.includes(producto.id)
        );
        
        if (negociosQueLoVenden.length > 0) {
            const mejorNegocio = negociosQueLoVenden.reduce((mejor, actual) => {
                if (!mejor) return actual;
                if (actual.distance < mejor.distance) return actual;
                if (actual.distance === mejor.distance && actual.rating > mejor.rating) return actual;
                return mejor;
            });
            
            return {
                ...producto,
                disponibleLocalmente: true,
                negociosDisponibles: negociosQueLoVenden.length,
                mejorNegocio: mejorNegocio,
                distanciaMinima: mejorNegocio.distance,
                tiempoDelivery: mejorNegocio.deliveryTime
            };
        }
        
        return {
            ...producto,
            disponibleLocalmente: false,
            negociosDisponibles: 0
        };
    });
}

// ===== FUNCIONES DE ACTUALIZACIÓN =====

/**
 * Actualiza la lista de negocios cercanos
 */
async function updateNearbyBusinesses() {
    if (!userLocation) {
        console.warn('⚠️ No hay ubicación del usuario');
        return;
    }
    
    negociosCercanos = filterBusinessesByRadius(GeoConfig.defaultRadius);
    
    // Disparar evento personalizado para que otros módulos se enteren
    const event = new CustomEvent('negociosCercanosUpdated', {
        detail: {
            negocios: negociosCercanos,
            userLocation: userLocation,
            count: negociosCercanos.length
        }
    });
    
    window.dispatchEvent(event);
    
    console.log(`📍 Negocios cercanos actualizados: ${negociosCercanos.length} encontrados`);
}

// ===== FUNCIONES DE UI Y MANEJO DE ERRORES =====

/**
 * Muestra errores de geolocalización al usuario
 * @param {string} errorType - Tipo de error
 */
function showLocationError(errorType) {
    const message = GeoConfig.errorMessages[errorType] || 'Error desconocido de geolocalización';
    
    console.error(`❌ Error de geolocalización: ${message}`);
    
    // Disparar evento de error para que la UI principal lo maneje
    const event = new CustomEvent('geolocationError', {
        detail: {
            type: errorType,
            message: message
        }
    });
    
    window.dispatchEvent(event);
}

/**
 * Muestra información de ubicación al usuario
 * @param {Object} location - Información de ubicación
 */
function showLocationInfo(location) {
    const comuna = detectUserComuna(location);
    const negociosCount = negociosCercanos.length;
    
    const event = new CustomEvent('locationDetected', {
        detail: {
            location: location,
            comuna: comuna,
            negociosCount: negociosCount,
            accuracy: location.accuracy
        }
    });
    
    window.dispatchEvent(event);
    
    console.log(`📍 Ubicación detectada en ${comuna}, ${negociosCount} negocios cercanos`);
}

// ===== FUNCIONES PÚBLICAS PARA DEBUG =====

/**
 * Simula una ubicación para pruebas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
function simulateLocation(lat, lng) {
    console.log(`🧪 Simulando ubicación: ${lat}, ${lng}`);
    
    userLocation = {
        lat: lat,
        lng: lng,
        accuracy: 10,
        timestamp: new Date().getTime(),
        simulated: true
    };
    
    updateNearbyBusinesses();
    showLocationInfo(userLocation);
}

/**
 * Obtiene estadísticas de la base de datos de negocios
 */
function getBusinessStats() {
    const stats = {
        total: negociosDatabase.length,
        activos: negociosDatabase.filter(n => n.activo).length,
        porComuna: {},
        porCategoria: {}
    };
    
    negociosDatabase.forEach(negocio => {
        // Por comuna
        stats.porComuna[negocio.comuna] = (stats.porComuna[negocio.comuna] || 0) + 1;
        
        // Por categoría
        stats.porCategoria[negocio.categoria] = (stats.porCategoria[negocio.categoria] || 0) + 1;
    });
    
    return stats;
}

// ===== API PÚBLICA =====
window.GeolocationManager = {
    // Información del sistema
    version: GeoConfig.version,
    isSupported: () => isGeolocationSupported,
    
    // Funciones principales
    init: async function(options = {}) {
        console.log('🏪 Inicializando Sistema de Geolocalización...');
        
        // Aplicar configuraciones personalizadas
        if (options.defaultRadius) {
            GeoConfig.defaultRadius = Math.min(options.defaultRadius, GeoConfig.maxRadius);
        }
        
        checkGeolocationSupport();
        
        try {
            await getCurrentLocation();
            await updateNearbyBusinesses();
            showLocationInfo(userLocation);
            
            console.log('✅ Sistema de Geolocalización inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando geolocalización:', error.message);
            return false;
        }
    },
    
    // Ubicación
    getCurrentLocation: getCurrentLocation,
    getUserLocation: () => userLocation,
    startWatching: startLocationWatching,
    stopWatching: stopLocationWatching,
    
    // Filtrado
    getNegociosCercanos: (radius) => filterBusinessesByRadius(radius),
    getNegociosPorComuna: (comuna) => filterBusinessesByComuna(comuna),
    getNegociosPorCategoria: (categoria, radius) => filterBusinessesByCategory(categoria, radius),
    
    // Productos
    getProductosLocales: () => getLocalProducts(),
    enrichProducts: (productos) => enrichProductsWithLocalInfo(productos),
    
    // Utilidades
    calculateDistance: calculateDistance,
    detectComuna: () => detectUserComuna(),
    
    // Debug y testing
    simulate: simulateLocation,
    getStats: getBusinessStats,
    getDatabase: () => negociosDatabase,
    
    // Estado actual
    isLocationAvailable: () => userLocation !== null,
    getLastUpdate: () => lastLocationUpdate,
    getNegociosCercanosCount: () => negociosCercanos.length
};

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Geolocalización lista para inicializar');
    
    // Auto-inicialización opcional (comentada por defecto)
    // GeolocationManager.init();
});

// ===== CLEANUP AL CERRAR =====
window.addEventListener('beforeunload', function() {
    stopLocationWatching();
    console.log('🏪 Sistema de Geolocalización limpiado');
});

// ===== LOG FINAL =====
console.log(`🏪 Sistema de Geolocalización v${GeoConfig.version} cargado`);
console.log(`📊 Base de datos: ${negociosDatabase.length} negocios en región ${currentRegion}`);
console.log('📍 Uso: GeolocationManager.init() para comenzar');

} // Fin de protección contra carga múltiple