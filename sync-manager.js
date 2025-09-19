// ===== SISTEMA DE SINCRONIZACIÓN EN TIEMPO REAL =====
// Archivo: sync-manager.js
// Versión: 1.0.0
// Descripción: Conecta cliente ↔ negocio en tiempo real usando localStorage + eventos

class SyncManager {
    constructor() {
        this.version = '1.0.0';
        this.storageKeys = {
            productos: 'negocioVecino_productos_sync',
            pedidos: 'negocioVecino_pedidos_sync',
            config: 'negocioVecino_config_sync',
            lastUpdate: 'negocioVecino_lastUpdate'
        };
        
        this.eventPrefix = 'negocioVecino_';
        this.subscribers = {};
        this.isInitialized = false;
        
        console.log(`🔄 SyncManager v${this.version} inicializando...`);
        this.initialize();
    }
    
    // ===== INICIALIZACIÓN =====
    initialize() {
        // Configurar listener para cambios en localStorage
        this.setupStorageListener();
        
        // Configurar eventos personalizados
        this.setupCustomEvents();
        
        // Sincronizar datos existentes
        this.syncExistingData();
        
        // Configurar heartbeat para mantener conexión
        this.setupHeartbeat();
        
        this.isInitialized = true;
        console.log('✅ SyncManager inicializado correctamente');
        
        // Disparar evento de inicialización
        this.emit('syncManagerReady', { version: this.version });
    }
    
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('negocioVecino_')) {
                this.handleStorageChange(e);
            }
        });
    }
    
    setupCustomEvents() {
        // Listener para eventos internos (misma pestaña)
        window.addEventListener('negocioVecino_internal', (e) => {
            this.handleInternalEvent(e.detail);
        });
    }
    
    setupHeartbeat() {
        // Actualizar timestamp cada 30 segundos para detectar actividad
        setInterval(() => {
            this.updateLastSeen();
        }, 30000);
    }
    
    // ===== GESTIÓN DE PRODUCTOS =====
    
    // Cuando el negocio agrega/edita un producto
    syncProductAdded(producto) {
        console.log('📦 Sincronizando producto agregado:', producto.nombre);
        
        const productos = this.getProducts();
        const existingIndex = productos.findIndex(p => p.id === producto.id);
        
        if (existingIndex !== -1) {
            productos[existingIndex] = producto;
            console.log('📝 Producto actualizado en sync');
        } else {
            productos.push(producto);
            console.log('➕ Producto agregado en sync');
        }
        
        this.saveProducts(productos);
        this.emit('productAdded', producto);
        this.emit('productsUpdated', productos);
    }
    
    // Cuando el negocio elimina un producto
    syncProductRemoved(productoId) {
        console.log('🗑️ Sincronizando producto eliminado:', productoId);
        
        const productos = this.getProducts();
        const updatedProducts = productos.filter(p => p.id !== productoId);
        
        this.saveProducts(updatedProducts);
        this.emit('productRemoved', { id: productoId });
        this.emit('productsUpdated', updatedProducts);
    }
    
    // Cuando el negocio actualiza stock
    syncProductStock(productoId, newStock) {
        console.log('📊 Sincronizando stock:', productoId, newStock);
        
        const productos = this.getProducts();
        const producto = productos.find(p => p.id === productoId);
        
        if (producto) {
            producto.stock = newStock;
            this.saveProducts(productos);
            this.emit('stockUpdated', { id: productoId, stock: newStock });
            this.emit('productsUpdated', productos);
        }
    }
    
    // Cuando el negocio activa/desactiva un producto
    syncProductStatus(productoId, isActive) {
        console.log('🔄 Sincronizando estado producto:', productoId, isActive);
        
        const productos = this.getProducts();
        const producto = productos.find(p => p.id === productoId);
        
        if (producto) {
            producto.activo = isActive;
            this.saveProducts(productos);
            this.emit('productStatusChanged', { id: productoId, active: isActive });
            this.emit('productsUpdated', productos);
        }
    }
    
    // ===== GESTIÓN DE PEDIDOS =====
    
    // Cuando el cliente crea un pedido
    syncOrderCreated(pedidoData) {
        console.log('🛍️ Sincronizando pedido creado:', pedidoData.id);
        
        const pedidos = this.getOrders();
        pedidos.unshift(pedidoData); // Agregar al inicio
        
        this.saveOrders(pedidos);
        this.emit('orderCreated', pedidoData);
        this.emit('ordersUpdated', pedidos);
        
        // Actualizar stock de productos
        this.updateProductStockFromOrder(pedidoData, 'subtract');
    }
    
    // Cuando el negocio cambia estado de pedido
    syncOrderStatusChanged(pedidoId, newStatus, additionalData = {}) {
        console.log('📋 Sincronizando estado pedido:', pedidoId, newStatus);
        
        const pedidos = this.getOrders();
        const pedido = pedidos.find(p => p.id === pedidoId);
        
        if (pedido) {
            pedido.estado = newStatus;
            pedido.lastUpdated = new Date().toISOString();
            
            // Agregar datos adicionales según el estado
            if (newStatus === 'confirmado' && additionalData.estimatedTime) {
                pedido.tiempoEstimado = additionalData.estimatedTime;
            }
            if (newStatus === 'rechazado' && additionalData.reason) {
                pedido.motivoRechazo = additionalData.reason;
                // Restaurar stock si se rechaza
                this.updateProductStockFromOrder(pedido, 'add');
            }
            
            this.saveOrders(pedidos);
            this.emit('orderStatusChanged', { id: pedidoId, status: newStatus, order: pedido });
            this.emit('ordersUpdated', pedidos);
        }
    }
    
    // Cuando se actualiza información de un pedido
    syncOrderUpdated(pedidoId, updates) {
        console.log('📝 Sincronizando actualización pedido:', pedidoId);
        
        const pedidos = this.getOrders();
        const pedido = pedidos.find(p => p.id === pedidoId);
        
        if (pedido) {
            Object.assign(pedido, updates);
            pedido.lastUpdated = new Date().toISOString();
            
            this.saveOrders(pedidos);
            this.emit('orderUpdated', { id: pedidoId, updates, order: pedido });
            this.emit('ordersUpdated', pedidos);
        }
    }
    
    // ===== GESTIÓN DE STOCK =====
    updateProductStockFromOrder(pedido, operation) {
        const productos = this.getProducts();
        let stockChanged = false;
        
        pedido.items.forEach(item => {
            const producto = productos.find(p => p.id === item.id);
            if (producto) {
                if (operation === 'subtract') {
                    producto.stock = Math.max(0, producto.stock - item.cantidad);
                } else if (operation === 'add') {
                    producto.stock += item.cantidad;
                }
                stockChanged = true;
            }
        });
        
        if (stockChanged) {
            this.saveProducts(productos);
            this.emit('stockUpdatedFromOrder', { orderId: pedido.id, operation });
            this.emit('productsUpdated', productos);
        }
    }
    
    // ===== PERSISTENCIA =====
    getProducts() {
        const stored = localStorage.getItem(this.storageKeys.productos);
        return stored ? JSON.parse(stored) : [];
    }
    
    saveProducts(productos) {
        localStorage.setItem(this.storageKeys.productos, JSON.stringify(productos));
        this.updateLastUpdate('productos');
    }
    
    getOrders() {
        const stored = localStorage.getItem(this.storageKeys.pedidos);
        return stored ? JSON.parse(stored) : [];
    }
    
    saveOrders(pedidos) {
        localStorage.setItem(this.storageKeys.pedidos, JSON.stringify(pedidos));
        this.updateLastUpdate('pedidos');
    }
    
    updateLastUpdate(type) {
        const updates = JSON.parse(localStorage.getItem(this.storageKeys.lastUpdate) || '{}');
        updates[type] = new Date().toISOString();
        localStorage.setItem(this.storageKeys.lastUpdate, JSON.stringify(updates));
    }
    
    updateLastSeen() {
        const updates = JSON.parse(localStorage.getItem(this.storageKeys.lastUpdate) || '{}');
        updates.lastSeen = new Date().toISOString();
        localStorage.setItem(this.storageKeys.lastUpdate, JSON.stringify(updates));
    }
    
    // ===== SINCRONIZACIÓN INICIAL =====
    syncExistingData() {
        // Sincronizar productos existentes del script principal
        if (window.productos && Array.isArray(window.productos)) {
            console.log('🔄 Sincronizando productos existentes...');
            this.saveProducts(window.productos);
        }
        
        // Sincronizar pedidos existentes
        if (window.pedidos && Array.isArray(window.pedidos)) {
            console.log('🔄 Sincronizando pedidos existentes...');
            this.saveOrders(window.pedidos);
        }
    }
    
    // ===== DETECTAR CAMBIOS EXTERNOS =====
    handleStorageChange(e) {
        const eventType = this.getEventTypeFromKey(e.key);
        if (!eventType) return;
        
        console.log('🔄 Cambio detectado en storage:', eventType);
        
        const newValue = e.newValue ? JSON.parse(e.newValue) : null;
        const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
        
        // Emitir eventos específicos según el tipo de cambio
        switch (eventType) {
            case 'productos':
                this.handleProductsChanged(newValue, oldValue);
                break;
            case 'pedidos':
                this.handleOrdersChanged(newValue, oldValue);
                break;
        }
    }
    
    handleProductsChanged(newProducts, oldProducts) {
        if (!newProducts) return;
        
        // Actualizar array principal si existe
        if (window.productos) {
            window.productos = [...newProducts];
            
            // Triggear re-render si las funciones existen
            if (typeof window.renderProductos === 'function') {
                window.renderProductos();
            }
            if (typeof window.renderProductosAdmin === 'function') {
                window.renderProductosAdmin();
            }
            if (typeof window.updateClienteStats === 'function') {
                window.updateClienteStats();
            }
        }
        
        this.emit('productsExternallyChanged', newProducts);
    }
    
    handleOrdersChanged(newOrders, oldOrders) {
        if (!newOrders) return;
        
        // Actualizar array principal si existe
        if (window.pedidos) {
            window.pedidos = [...newOrders];
            
            // Triggear re-render si las funciones existen
            if (typeof window.renderPedidos === 'function') {
                window.renderPedidos();
            }
            if (typeof window.updateAdminStats === 'function') {
                window.updateAdminStats();
            }
        }
        
        this.emit('ordersExternallyChanged', newOrders);
    }
    
    handleInternalEvent(eventData) {
        console.log('🔄 Evento interno recibido:', eventData.type);
        
        // Procesar eventos internos de la misma pestaña
        switch (eventData.type) {
            case 'productAdded':
            case 'productUpdated':
                this.syncProductAdded(eventData.data);
                break;
            case 'productRemoved':
                this.syncProductRemoved(eventData.data);
                break;
            case 'orderCreated':
                this.syncOrderCreated(eventData.data);
                break;
            case 'orderStatusChanged':
                this.syncOrderStatusChanged(eventData.data.id, eventData.data.status, eventData.data.additionalData);
                break;
        }
    }
    
    // ===== EVENTOS =====
    emit(eventType, data) {
        const eventName = this.eventPrefix + eventType;
        
        // Evento personalizado
        const customEvent = new CustomEvent(eventName, {
            detail: { type: eventType, data, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(customEvent);
        
        // También emitir evento interno para misma pestaña
        const internalEvent = new CustomEvent(this.eventPrefix + 'internal', {
            detail: { type: eventType, data, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(internalEvent);
        
        // Llamar subscribers si existen
        if (this.subscribers[eventType]) {
            this.subscribers[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error en subscriber:', error);
                }
            });
        }
    }
    
    on(eventType, callback) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push(callback);
        
        // También escuchar el evento DOM
        window.addEventListener(this.eventPrefix + eventType, (e) => {
            callback(e.detail.data);
        });
    }
    
    off(eventType, callback) {
        if (this.subscribers[eventType]) {
            this.subscribers[eventType] = this.subscribers[eventType].filter(cb => cb !== callback);
        }
    }
    
    // ===== UTILIDADES =====
    getEventTypeFromKey(key) {
        const keyMap = {
            [this.storageKeys.productos]: 'productos',
            [this.storageKeys.pedidos]: 'pedidos',
            [this.storageKeys.config]: 'config'
        };
        return keyMap[key];
    }
    
    // ===== API PÚBLICA =====
    
    // Forzar sincronización completa
    forceSyncAll() {
        console.log('🔄 Forzando sincronización completa...');
        this.syncExistingData();
        this.emit('forceSyncCompleted', { timestamp: new Date().toISOString() });
    }
    
    // Obtener estado de sincronización
    getSyncStatus() {
        const lastUpdates = JSON.parse(localStorage.getItem(this.storageKeys.lastUpdate) || '{}');
        const productos = this.getProducts();
        const pedidos = this.getOrders();
        
        return {
            isInitialized: this.isInitialized,
            productsCount: productos.length,
            ordersCount: pedidos.length,
            lastUpdates,
            version: this.version
        };
    }
    
    // Limpiar todos los datos sincronizados
    clearSyncData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🧹 Datos de sincronización limpiados');
        this.emit('syncDataCleared', { timestamp: new Date().toISOString() });
    }
    
    // ===== DEBUG =====
    debug() {
        console.log('🔍 SyncManager Debug Info:');
        console.log('- Estado:', this.getSyncStatus());
        console.log('- Productos sincronizados:', this.getProducts());
        console.log('- Pedidos sincronizados:', this.getOrders());
        console.log('- Subscribers:', this.subscribers);
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    // Crear instancia global
    window.syncManager = new SyncManager();
    
    // Funciones helper globales
    window.syncProduct = (producto) => {
        window.syncManager.syncProductAdded(producto);
    };
    
    window.syncOrder = (pedido) => {
        window.syncManager.syncOrderCreated(pedido);
    };
    
    window.syncOrderStatus = (pedidoId, status, additionalData) => {
        window.syncManager.syncOrderStatusChanged(pedidoId, status, additionalData);
    };
    
    console.log('🔄 SyncManager disponible globalmente');
}

console.log('🔄 SyncManager v1.0.0 cargado - Funciones: syncProduct(), syncOrder(), etc.');