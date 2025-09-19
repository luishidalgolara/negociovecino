// ===== CONECTOR EN TIEMPO REAL =====
// Archivo: real-time-connector.js
// Versión: 1.0.0
// Descripción: Conecta script.js principal con sync-manager para sincronización automática

class RealTimeConnector {
    constructor() {
        this.version = '1.0.0';
        this.syncManager = null;
        this.isConnected = false;
        this.originalFunctions = {};
        
        console.log(`🔗 RealTimeConnector v${this.version} inicializando...`);
        this.waitForDependencies();
    }
    
    // ===== INICIALIZACIÓN =====
    waitForDependencies() {
        const checkDependencies = () => {
            if (window.syncManager && 
                typeof window.productos !== 'undefined' &&
                typeof window.carrito !== 'undefined') {
                    
                this.syncManager = window.syncManager;
                this.connect();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
    }
    
    connect() {
        console.log('🔗 Conectando con sistemas...');
        
        // Interceptar funciones originales
        this.interceptProductFunctions();
        this.interceptOrderFunctions();
        this.interceptCartFunctions();
        
        // Configurar listeners de sincronización
        this.setupSyncListeners();
        
        // Sincronización inicial
        this.performInitialSync();
        
        this.isConnected = true;
        console.log('✅ RealTimeConnector conectado correctamente');
    }
    
    // ===== INTERCEPTORES DE PRODUCTOS =====
    interceptProductFunctions() {
        // Interceptar función de guardar producto
        if (typeof window.guardarProducto === 'function') {
            this.originalFunctions.guardarProducto = window.guardarProducto;
            window.guardarProducto = (...args) => {
                // Ejecutar función original
                const result = this.originalFunctions.guardarProducto.apply(this, args);
                
                // Sincronizar cambios
                setTimeout(() => {
                    this.syncProductChanges();
                }, 100);
                
                return result;
            };
        }
        
        // Interceptar función de eliminar producto
        if (typeof window.eliminarProducto === 'function') {
            this.originalFunctions.eliminarProducto = window.eliminarProducto;
            window.eliminarProducto = (productoId) => {
                // Ejecutar función original
                const result = this.originalFunctions.eliminarProducto.call(this, productoId);
                
                // Sincronizar eliminación
                this.syncManager.syncProductRemoved(productoId);
                
                return result;
            };
        }
        
        // Interceptar función de toggle activo
        if (typeof window.toggleProductoActivo === 'function') {
            this.originalFunctions.toggleProductoActivo = window.toggleProductoActivo;
            window.toggleProductoActivo = (productoId) => {
                // Ejecutar función original
                const result = this.originalFunctions.toggleProductoActivo.call(this, productoId);
                
                // Sincronizar cambio de estado
                const producto = window.productos.find(p => p.id === productoId);
                if (producto) {
                    this.syncManager.syncProductStatus(productoId, producto.activo);
                }
                
                return result;
            };
        }
        
        console.log('🔧 Funciones de productos interceptadas');
    }
    
    // ===== INTERCEPTORES DE PEDIDOS =====
    interceptOrderFunctions() {
        // Interceptar procesamiento de pedido original
        if (typeof window.procesarPedido === 'function') {
            this.originalFunctions.procesarPedido = window.procesarPedido;
            window.procesarPedido = (...args) => {
                console.log('🔄 Pedido interceptado, redirigiendo a sistema de pago...');
                
                // Si existe payment integration, usar eso
                if (window.paymentIntegration && window.paymentIntegration.showPaymentModal) {
                    window.paymentIntegration.showPaymentModal();
                } else {
                    // Fallback: usar función original
                    return this.originalFunctions.procesarPedido.apply(this, args);
                }
            };
        }
        
        // Interceptar confirmación de pedido
        if (typeof window.confirmarPedido === 'function') {
            this.originalFunctions.confirmarPedido = window.confirmarPedido;
            window.confirmarPedido = (pedidoId) => {
                // Ejecutar función original
                const result = this.originalFunctions.confirmarPedido.call(this, pedidoId);
                
                // Sincronizar cambio de estado
                this.syncManager.syncOrderStatusChanged(pedidoId, 'confirmado');
                
                return result;
            };
        }
        
        // Interceptar rechazo de pedido
        if (typeof window.rechazarPedido === 'function') {
            this.originalFunctions.rechazarPedido = window.rechazarPedido;
            window.rechazarPedido = (pedidoId) => {
                // Ejecutar función original
                const result = this.originalFunctions.rechazarPedido.call(this, pedidoId);
                
                // Sincronizar cambio de estado
                this.syncManager.syncOrderStatusChanged(pedidoId, 'rechazado');
                
                return result;
            };
        }
        
        console.log('🔧 Funciones de pedidos interceptadas');
    }
    
    // ===== INTERCEPTORES DE CARRITO =====
    interceptCartFunctions() {
        // Interceptar agregar al carrito para actualizar stock en tiempo real
        if (typeof window.addToCart === 'function') {
            this.originalFunctions.addToCart = window.addToCart;
            window.addToCart = (productoId) => {
                // Verificar stock actualizado antes de agregar
                const syncedProducts = this.syncManager.getProducts();
                const syncedProduct = syncedProducts.find(p => p.id === productoId);
                const localProduct = window.productos.find(p => p.id === productoId);
                
                if (syncedProduct && localProduct) {
                    // Actualizar stock local con el sincronizado
                    localProduct.stock = syncedProduct.stock;
                    
                    // Verificar si hay suficiente stock
                    const quantityInput = document.getElementById(`qty-${productoId}`);
                    const quantity = parseInt(quantityInput?.value || 1);
                    
                    if (syncedProduct.stock < quantity) {
                        window.showToast(`Solo quedan ${syncedProduct.stock} unidades disponibles`, 'warning');
                        if (quantityInput) {
                            quantityInput.value = syncedProduct.stock;
                        }
                        return;
                    }
                }
                
                // Ejecutar función original
                return this.originalFunctions.addToCart.call(this, productoId);
            };
        }
        
        console.log('🔧 Funciones de carrito interceptadas');
    }
    
    // ===== LISTENERS DE SINCRONIZACIÓN =====
    setupSyncListeners() {
        // Escuchar cambios de productos desde otras pestañas
        this.syncManager.on('productsExternallyChanged', (products) => {
            console.log('📦 Productos actualizados externamente');
            this.updateLocalProducts(products);
        });
        
        // Escuchar cambios de pedidos desde otras pestañas
        this.syncManager.on('ordersExternallyChanged', (orders) => {
            console.log('📋 Pedidos actualizados externamente');
            this.updateLocalOrders(orders);
        });
        
        // Escuchar nuevos pedidos
        this.syncManager.on('orderCreated', (order) => {
            console.log('🛍️ Nuevo pedido recibido');
            this.handleNewOrder(order);
        });
        
        // Escuchar cambios de estado de pedidos
        this.syncManager.on('orderStatusChanged', (data) => {
            console.log('📋 Estado de pedido cambiado:', data.status);
            this.handleOrderStatusChange(data);
        });
        
        // Escuchar actualizaciones de stock
        this.syncManager.on('stockUpdated', (data) => {
            console.log('📊 Stock actualizado:', data.id, data.stock);
            this.updateLocalProductStock(data.id, data.stock);
        });
        
        console.log('👂 Listeners de sincronización configurados');
    }
    
    // ===== MANEJO DE ACTUALIZACIONES =====
    updateLocalProducts(syncedProducts) {
        if (!window.productos || !Array.isArray(window.productos)) return;
        
        // Actualizar array local
        window.productos = [...syncedProducts];
        
        // Re-renderizar vistas
        this.safeCall('renderProductos');
        this.safeCall('renderProductosAdmin');
        this.safeCall('updateClienteStats');
        this.safeCall('updateAdminStats');
        
        // Notificar cambio
        this.showSyncNotification('Productos actualizados', 'info');
    }
    
    updateLocalOrders(syncedOrders) {
        if (!window.pedidos || !Array.isArray(window.pedidos)) return;
        
        // Actualizar array local
        window.pedidos = [...syncedOrders];
        
        // Re-renderizar vistas
        this.safeCall('renderPedidos');
        this.safeCall('updateAdminStats');
        
        // Notificar cambio
        this.showSyncNotification('Pedidos actualizados', 'info');
    }
    
    updateLocalProductStock(productId, newStock) {
        if (!window.productos) return;
        
        const product = window.productos.find(p => p.id === productId);
        if (product) {
            product.stock = newStock;
            
            // Re-renderizar vistas
            this.safeCall('renderProductos');
            this.safeCall('renderProductosAdmin');
            
            // Actualizar carrito si es necesario
            this.validateCartStock();
        }
    }
    
    handleNewOrder(order) {
        // Si estamos en la vista de negocio, mostrar notificación
        const negocioInterface = document.getElementById('negocioInterface');
        if (negocioInterface && negocioInterface.classList.contains('active')) {
            this.showSyncNotification(`Nuevo pedido de ${order.nombreCliente}`, 'success');
            
            // Reproducir sonido si está disponible
            if (window.notificationSystem && window.notificationSystem.playNotificationSound) {
                window.notificationSystem.playNotificationSound();
            }
        }
        
        // Agregar al array local si no existe
        if (window.pedidos && !window.pedidos.find(p => p.id === order.id)) {
            window.pedidos.unshift(order);
            this.safeCall('renderPedidos');
            this.safeCall('updateAdminStats');
        }
    }
    
    handleOrderStatusChange(data) {
        // Si estamos en la vista de cliente y es nuestro pedido, mostrar notificación
        const clienteInterface = document.getElementById('clienteInterface');
        if (clienteInterface && clienteInterface.classList.contains('active')) {
            const statusMessages = {
                'confirmado': 'Tu pedido ha sido confirmado',
                'rechazado': 'Tu pedido ha sido rechazado',
                'listo': 'Tu pedido está listo para retirar'
            };
            
            const message = statusMessages[data.status];
            if (message) {
                this.showSyncNotification(message, data.status === 'rechazado' ? 'warning' : 'success');
            }
        }
        
        // Actualizar array local
        if (window.pedidos) {
            const order = window.pedidos.find(p => p.id === data.id);
            if (order) {
                order.estado = data.status;
                this.safeCall('renderPedidos');
                this.safeCall('updateAdminStats');
            }
        }
    }
    
    // ===== VALIDACIONES =====
    validateCartStock() {
        if (!window.carrito || !window.productos) return;
        
        let cartUpdated = false;
        const syncedProducts = this.syncManager.getProducts();
        
        window.carrito.forEach(cartItem => {
            const syncedProduct = syncedProducts.find(p => p.id === cartItem.id);
            if (syncedProduct && cartItem.cantidad > syncedProduct.stock) {
                console.log(`⚠️ Ajustando cantidad en carrito: ${cartItem.nombre}`);
                cartItem.cantidad = syncedProduct.stock;
                cartUpdated = true;
                
                if (syncedProduct.stock === 0) {
                    // Remover del carrito si no hay stock
                    window.carrito = window.carrito.filter(item => item.id !== cartItem.id);
                    this.showSyncNotification(`${cartItem.nombre} se agotó y fue removido del carrito`, 'warning');
                } else {
                    this.showSyncNotification(`Cantidad de ${cartItem.nombre} ajustada por disponibilidad`, 'info');
                }
            }
        });
        
        if (cartUpdated) {
            this.safeCall('updateCarrito');
        }
    }
    
    // ===== SINCRONIZACIÓN =====
    syncProductChanges() {
        if (!window.productos) return;
        
        // Encontrar el producto más reciente (el que se acaba de modificar)
        const sortedProducts = [...window.productos].sort((a, b) => b.id - a.id);
        const latestProduct = sortedProducts[0];
        
        if (latestProduct) {
            this.syncManager.syncProductAdded(latestProduct);
            console.log('📦 Producto sincronizado:', latestProduct.nombre);
        }
    }
    
    performInitialSync() {
        console.log('🔄 Realizando sincronización inicial...');
        
        // Sincronizar productos existentes
        if (window.productos && window.productos.length > 0) {
            window.productos.forEach(producto => {
                this.syncManager.syncProductAdded(producto);
            });
        }
        
        // Sincronizar pedidos existentes
        if (window.pedidos && window.pedidos.length > 0) {
            window.pedidos.forEach(pedido => {
                this.syncManager.syncOrderCreated(pedido);
            });
        }
        
        console.log('✅ Sincronización inicial completada');
    }
    
    // ===== UTILIDADES =====
    safeCall(functionName, ...args) {
        if (typeof window[functionName] === 'function') {
            try {
                return window[functionName](...args);
            } catch (error) {
                console.warn(`⚠️ Error ejecutando ${functionName}:`, error);
            }
        }
    }
    
    showSyncNotification(message, type = 'info') {
        // Usar sistema de toast si está disponible
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }
    
    // ===== API PÚBLICA =====
    
    // Forzar sincronización manual
    forceSyncNow() {
        console.log('🔄 Forzando sincronización manual...');
        this.performInitialSync();
        this.validateCartStock();
        
        // Actualizar vistas
        this.safeCall('renderProductos');
        this.safeCall('renderProductosAdmin');
        this.safeCall('renderPedidos');
        this.safeCall('updateCarrito');
        this.safeCall('updateAdminStats');
        this.safeCall('updateClienteStats');
        
        this.showSyncNotification('Sincronización manual completada', 'success');
    }
    
    // Verificar estado de conexión
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            syncManager: !!this.syncManager,
            interceptedFunctions: Object.keys(this.originalFunctions),
            version: this.version
        };
    }
    
    // Desconectar y restaurar funciones originales
    disconnect() {
        console.log('🔌 Desconectando RealTimeConnector...');
        
        // Restaurar funciones originales
        Object.keys(this.originalFunctions).forEach(functionName => {
            if (window[functionName]) {
                window[functionName] = this.originalFunctions[functionName];
            }
        });
        
        this.isConnected = false;
        this.originalFunctions = {};
        
        console.log('🔌 RealTimeConnector desconectado');
    }
    
    // ===== DEBUG =====
    debug() {
        console.log('🔍 RealTimeConnector Debug Info:');
        console.log('- Estado de conexión:', this.getConnectionStatus());
        console.log('- SyncManager:', this.syncManager?.getSyncStatus());
        console.log('- Productos locales:', window.productos?.length || 0);
        console.log('- Pedidos locales:', window.pedidos?.length || 0);
        console.log('- Carrito actual:', window.carrito?.length || 0);
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    // Crear instancia global
    window.realTimeConnector = new RealTimeConnector();
    
    // Funciones helper globales
    window.forceSyncNow = () => {
        if (window.realTimeConnector) {
            window.realTimeConnector.forceSyncNow();
        }
    };
    
    window.getSyncStatus = () => {
        if (window.realTimeConnector && window.syncManager) {
            return {
                connector: window.realTimeConnector.getConnectionStatus(),
                sync: window.syncManager.getSyncStatus()
            };
        }
        return null;
    };
    
    console.log('🔗 RealTimeConnector disponible globalmente');
}

console.log('🔗 RealTimeConnector v1.0.0 cargado - Funciones: forceSyncNow(), getSyncStatus(), etc.');