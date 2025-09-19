// ===== INTEGRACIÓN CON SCRIPT PRINCIPAL =====
// Archivo: script-integration.js
// Versión: 1.0.1 - CORREGIDA
// Descripción: Conecta todos los sistemas con el script.js principal de forma no invasiva

class ScriptIntegration {
    constructor() {
        this.version = '1.0.1';
        this.integrationStatus = {
            syncManager: false,
            realTimeConnector: false,
            paymentIntegration: false,
            notificationSystem: false,
            digitalReceipts: false,
            orderRefunds: false
        };
        
        console.log(`🔧 ScriptIntegration v${this.version} inicializando...`);
        this.waitForSystems();
    }
    
    // ===== ESPERAR SISTEMAS =====
    waitForSystems() {
        const checkInterval = setInterval(() => {
            this.checkSystemAvailability();
            
            if (this.allSystemsReady()) {
                clearInterval(checkInterval);
                this.integrate();
            }
        }, 500);
        
        // Timeout después de 10 segundos
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!this.allSystemsReady()) {
                console.warn('⚠️ No todos los sistemas están disponibles, integrando parcialmente...');
                this.integrate();
            }
        }, 10000);
    }
    
    checkSystemAvailability() {
        this.integrationStatus.syncManager = !!window.syncManager;
        this.integrationStatus.realTimeConnector = !!window.realTimeConnector;
        this.integrationStatus.paymentIntegration = !!window.paymentIntegration;
        this.integrationStatus.notificationSystem = !!window.notificationSystem;
        this.integrationStatus.digitalReceipts = !!window.digitalReceiptGenerator;
        this.integrationStatus.orderRefunds = !!window.orderRefundManager;
    }
    
    allSystemsReady() {
        return Object.values(this.integrationStatus).every(status => status === true);
    }
    
    // ===== INTEGRACIÓN PRINCIPAL =====
    integrate() {
        console.log('🔗 Iniciando integración con script principal...');
        console.log('📊 Estado de sistemas:', this.integrationStatus);
        
        // Esperar a que script.js esté completamente cargado
        this.waitForMainScript(() => {
            // Integrar con funciones existentes
            this.integrateProductFunctions();
            this.integrateOrderFunctions();
            this.integrateUIEnhancements();
            this.setupGlobalEventListeners();
            this.enhanceExistingElements();
            
            // Configurar botones administrativos
            this.setupAdminButtons();
            
            // Inyectar estilos globales
            this.injectGlobalStyles();
            
            console.log('✅ Integración completada');
            this.showIntegrationStatus();
        });
    }
    
    // ===== ESPERAR SCRIPT PRINCIPAL =====
    waitForMainScript(callback) {
        const checkMainScript = () => {
            // Verificar que las variables y funciones principales estén disponibles
            if (window.productos && 
                Array.isArray(window.productos) && 
                typeof window.addToCart === 'function' &&
                typeof window.showToast === 'function') {
                
                console.log('✅ Script principal detectado y listo');
                callback();
            } else {
                console.log('⏳ Esperando script principal...');
                setTimeout(checkMainScript, 500);
            }
        };
        
        checkMainScript();
    }
    
    // ===== INTEGRACIÓN DE PRODUCTOS =====
    integrateProductFunctions() {
        // Mejorar función de guardar producto
        if (typeof window.guardarProducto === 'function' && !window.guardarProducto._enhanced) {
            const originalGuardarProducto = window.guardarProducto;
            
            window.guardarProducto = function() {
                // Ejecutar función original
                const result = originalGuardarProducto.apply(this, arguments);
                
                // Sincronizar después de guardar
                setTimeout(() => {
                    if (window.syncManager && window.productos && window.productos.length > 0) {
                        const latestProduct = window.productos[window.productos.length - 1];
                        window.syncManager.syncProductAdded(latestProduct);
                        
                        // Notificar si hay clientes conectados
                        if (window.notificationSystem) {
                            console.log('📦 Nuevo producto sincronizado:', latestProduct.nombre);
                        }
                    }
                }, 100);
                
                return result;
            };
            
            window.guardarProducto._enhanced = true;
            console.log('📦 Función guardarProducto mejorada');
        }
        
        // Mejorar renderizado de productos
        if (typeof window.renderProductos === 'function' && !window.renderProductos._enhanced) {
            const originalRenderProductos = window.renderProductos;
            
            window.renderProductos = function() {
                // Sincronizar productos antes de renderizar
                if (window.syncManager) {
                    const syncedProducts = window.syncManager.getProducts();
                    if (syncedProducts.length > 0 && window.productos) {
                        // Actualizar productos locales con datos sincronizados
                        window.productos = [...syncedProducts];
                    }
                }
                
                // Ejecutar función original
                return originalRenderProductos.apply(this, arguments);
            };
            
            window.renderProductos._enhanced = true;
            console.log('🖼️ Función renderProductos mejorada');
        }
    }
    
    // ===== INTEGRACIÓN DE PEDIDOS =====
    integrateOrderFunctions() {
        // Interceptar el flujo de procesamiento de pedidos
        if (typeof window.procesarPedido === 'function' && !window.procesarPedido._enhanced) {
            const originalProcesarPedido = window.procesarPedido;
            
            window.procesarPedido = function() {
                // Redirigir al sistema de pago integrado
                if (window.paymentIntegration && window.paymentIntegration.showPaymentModal) {
                    console.log('💳 Redirigiendo a sistema de pago integrado...');
                    window.paymentIntegration.showPaymentModal();
                    return;
                }
                
                // Fallback: función original
                return originalProcesarPedido.apply(this, arguments);
            };
            
            window.procesarPedido._enhanced = true;
            console.log('🛍️ Función procesarPedido interceptada');
        }
        
        // Mejorar función de confirmación de pedidos
        if (typeof window.confirmarPedido === 'function' && !window.confirmarPedido._enhanced) {
            const originalConfirmarPedido = window.confirmarPedido;
            
            window.confirmarPedido = function(pedidoId) {
                // Ejecutar función original
                const result = originalConfirmarPedido.apply(this, arguments);
                
                // Notificar cambio de estado
                if (window.notificationSystem && window.pedidos) {
                    const pedido = window.pedidos.find(p => p.id === pedidoId);
                    if (pedido) {
                        window.notificationSystem.notifyOrderConfirmed(
                            pedidoId, 
                            { nombre: pedido.nombreCliente },
                            '30 minutos'
                        );
                    }
                }
                
                return result;
            };
            
            window.confirmarPedido._enhanced = true;
            console.log('✅ Función confirmarPedido mejorada');
        }
    }
    
    // ===== MEJORAS DE UI =====
    integrateUIEnhancements() {
        // Agregar indicadores de sincronización
        this.addSyncIndicators();
        
        // Agregar botón de centro de notificaciones
        this.addNotificationCenter();
        
        // Agregar botón de sincronización manual
        this.addManualSyncButton();
        
        // Mejorar carrito con validación en tiempo real
        this.enhanceCart();
    }
    
    addSyncIndicators() {
        const header = document.querySelector('.main-header .container');
        if (!header || document.getElementById('syncIndicator')) return;
        
        const syncIndicator = document.createElement('div');
        syncIndicator.id = 'syncIndicator';
        syncIndicator.className = 'sync-indicator';
        syncIndicator.innerHTML = `
            <div class="sync-status" title="Estado de sincronización">
                <i class="fas fa-sync-alt"></i>
                <span class="sync-text">Sincronizado</span>
            </div>
        `;
        
        header.appendChild(syncIndicator);
        
        // Actualizar estado cada 5 segundos
        setInterval(() => {
            this.updateSyncIndicator();
        }, 5000);
        
        console.log('🔄 Indicador de sincronización agregado');
    }
    
    addNotificationCenter() {
        const headerControls = document.querySelector('.header-controls');
        if (!headerControls || document.getElementById('notificationButton')) return;
        
        const notificationButton = document.createElement('button');
        notificationButton.id = 'notificationButton';
        notificationButton.className = 'notification-button';
        notificationButton.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
        `;
        notificationButton.title = 'Centro de notificaciones';
        
        notificationButton.addEventListener('click', () => {
            if (window.notificationSystem) {
                window.notificationSystem.openNotificationCenter();
            }
        });
        
        // Insertar antes del botón de tema
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            headerControls.insertBefore(notificationButton, themeToggle);
        } else {
            headerControls.appendChild(notificationButton);
        }
        
        console.log('🔔 Botón de notificaciones agregado');
    }
    
    addManualSyncButton() {
        // Solo agregar en la vista de negocio
        const negocioInterface = document.getElementById('negocioInterface');
        if (!negocioInterface) return;
        
        const businessTabs = document.querySelector('.business-tabs');
        if (!businessTabs || document.getElementById('manualSyncButton')) return;
        
        const syncButton = document.createElement('button');
        syncButton.id = 'manualSyncButton';
        syncButton.className = 'business-tab sync-tab';
        syncButton.innerHTML = `
            <i class="fas fa-sync"></i>
            <span>Sincronizar</span>
        `;
        syncButton.title = 'Forzar sincronización manual';
        
        syncButton.addEventListener('click', () => {
            this.performManualSync();
        });
        
        businessTabs.appendChild(syncButton);
        console.log('🔄 Botón de sincronización manual agregado');
    }
    
    // ===== CORRECCIÓN PRINCIPAL: FUNCIÓN ENHANCE CART =====
    enhanceCart() {
        // Interceptar función de agregar al carrito para validar stock
        if (typeof window.addToCart === 'function' && !window.addToCart._enhanced) {
            const originalAddToCart = window.addToCart;
            
            window.addToCart = function(productoId) {
                // CORRECCIÓN: Verificar que window.productos existe y es un array antes de usarlo
                if (window.productos && Array.isArray(window.productos) && window.productos.length > 0) {
                    try {
                        // Validar stock sincronizado antes de agregar
                        if (window.syncManager) {
                            const syncedProducts = window.syncManager.getProducts();
                            if (syncedProducts && Array.isArray(syncedProducts)) {
                                const syncedProduct = syncedProducts.find(p => p.id === productoId);
                                const localProduct = window.productos.find(p => p.id === productoId);
                                
                                if (syncedProduct && localProduct && syncedProduct.stock !== localProduct.stock) {
                                    // Actualizar stock local
                                    localProduct.stock = syncedProduct.stock;
                                    
                                    // Re-renderizar productos
                                    if (typeof window.renderProductos === 'function') {
                                        window.renderProductos();
                                    }
                                    
                                    if (typeof window.showToast === 'function') {
                                        window.showToast('Stock actualizado automáticamente', 'info');
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.warn('⚠️ Error en validación de stock:', error);
                    }
                } else {
                    // Si productos no está disponible, log de advertencia pero continuar
                    console.warn('⚠️ window.productos no está disponible aún, ejecutando función original');
                }
                
                // Ejecutar función original siempre
                try {
                    return originalAddToCart.apply(this, arguments);
                } catch (error) {
                    console.error('❌ Error en función addToCart original:', error);
                    // Fallback: mostrar mensaje de error al usuario
                    if (typeof window.showToast === 'function') {
                        window.showToast('Error al agregar producto al carrito', 'error');
                    }
                }
            };
            
            window.addToCart._enhanced = true;
            console.log('🛒 Función addToCart mejorada con verificaciones de seguridad');
        }
    }
    
    // ===== BOTONES ADMINISTRATIVOS =====
    setupAdminButtons() {
        // Esperar a que la vista de negocio esté disponible
        setTimeout(() => {
            this.addReceiptHistoryButton();
            this.addRefundStatsButton();
            this.addDebugButton();
        }, 1000);
    }
    
    addReceiptHistoryButton() {
        const configSection = document.querySelector('.config-grid');
        if (!configSection || document.getElementById('receiptHistoryCard')) return;
        
        const receiptCard = document.createElement('div');
        receiptCard.id = 'receiptHistoryCard';
        receiptCard.className = 'config-card';
        receiptCard.innerHTML = `
            <h4><i class="fas fa-receipt"></i> Historial de Boletas</h4>
            <p>Ver todas las boletas digitales generadas</p>
            <button class="btn-primary" onclick="scriptIntegration.showReceiptHistory()">Ver Historial</button>
        `;
        
        configSection.appendChild(receiptCard);
        console.log('🎫 Botón de historial de boletas agregado');
    }
    
    addRefundStatsButton() {
        const configSection = document.querySelector('.config-grid');
        if (!configSection || document.getElementById('refundStatsCard')) return;
        
        const refundCard = document.createElement('div');
        refundCard.id = 'refundStatsCard';
        refundCard.className = 'config-card';
        refundCard.innerHTML = `
            <h4><i class="fas fa-undo"></i> Reembolsos</h4>
            <p>Estadísticas y gestión de reembolsos</p>
            <button class="btn-primary" onclick="scriptIntegration.showRefundStats()">Ver Stats</button>
        `;
        
        configSection.appendChild(refundCard);
        console.log('💸 Botón de estadísticas de reembolsos agregado');
    }
    
    addDebugButton() {
        const configSection = document.querySelector('.config-grid');
        if (!configSection || document.getElementById('debugCard')) return;
        
        const debugCard = document.createElement('div');
        debugCard.id = 'debugCard';
        debugCard.className = 'config-card';
        debugCard.innerHTML = `
            <h4><i class="fas fa-bug"></i> Debug del Sistema</h4>
            <p>Información de debug y diagnóstico</p>
            <button class="btn-primary" onclick="scriptIntegration.showDebugInfo()">Debug</button>
        `;
        
        configSection.appendChild(debugCard);
        console.log('🐛 Botón de debug agregado');
    }
    
    // ===== FUNCIONES DE BOTONES =====
    showReceiptHistory() {
        if (!window.digitalReceiptGenerator) {
            this.showToast('Sistema de boletas no disponible', 'error');
            return;
        }
        
        const receipts = window.digitalReceiptGenerator.getAllReceipts();
        const stats = window.digitalReceiptGenerator.getReceiptStats();
        
        alert(`Historial de Boletas:
        
Total de boletas: ${stats.totalReceipts}
Boletas de hoy: ${stats.todayReceipts}
Ingresos de hoy: $${this.formatPrice(stats.totalAmountToday)}
Última boleta: ${stats.lastReceiptNumber}

Consulta la consola para ver el listado completo.`);
        
        console.log('🎫 Historial de boletas:', receipts);
    }
    
    showRefundStats() {
        if (!window.orderRefundManager) {
            this.showToast('Sistema de reembolsos no disponible', 'error');
            return;
        }
        
        const stats = window.orderRefundManager.getRefundStats();
        
        alert(`Estadísticas de Reembolsos:
        
Total de reembolsos: ${stats.totalRefunds}
Reembolsos de hoy: ${stats.todayRefunds}
Monto total hoy: $${this.formatPrice(stats.totalAmountToday)}
Promedio por reembolso: $${this.formatPrice(stats.avgRefundAmount)}`);
        
        console.log('💸 Estadísticas de reembolsos:', stats);
    }
    
    showDebugInfo() {
        const debugInfo = {
            integration: this.integrationStatus,
            sync: window.syncManager?.getSyncStatus(),
            connector: window.realTimeConnector?.getConnectionStatus(),
            productos: window.productos?.length || 0,
            pedidos: window.pedidos?.length || 0,
            carrito: window.carrito?.length || 0,
            scriptLoaded: {
                addToCart: typeof window.addToCart === 'function',
                productos: !!window.productos,
                showToast: typeof window.showToast === 'function'
            },
            timestamp: new Date().toISOString()
        };
        
        console.log('🐛 Debug Info:', debugInfo);
        
        // Mostrar en modal
        this.showDebugModal(JSON.stringify(debugInfo, null, 2));
    }
    
    showDebugModal(debugText) {
        const modal = document.createElement('div');
        modal.className = 'modal debug-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-bug"></i> Debug del Sistema</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow: auto; max-height: 400px;">${debugText}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                    <button class="btn-primary" onclick="scriptIntegration.copyDebugInfo()">Copiar Info</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 30000);
    }
    
    copyDebugInfo() {
        const debugInfo = {
            integration: this.integrationStatus,
            sync: window.syncManager?.getSyncStatus(),
            connector: window.realTimeConnector?.getConnectionStatus(),
            productos: window.productos?.length || 0,
            pedidos: window.pedidos?.length || 0,
            carrito: window.carrito?.length || 0,
            timestamp: new Date().toISOString()
        };
        
        const debugText = JSON.stringify(debugInfo, null, 2);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(debugText).then(() => {
                this.showToast('Información de debug copiada', 'success');
            });
        }
    }
    
    // ===== EVENTOS GLOBALES =====
    setupGlobalEventListeners() {
        // Escuchar eventos de sincronización
        window.addEventListener('negocioVecino_productsUpdated', (e) => {
            console.log('📦 Productos actualizados globalmente');
            this.updateSyncIndicator();
        });
        
        window.addEventListener('negocioVecino_ordersUpdated', (e) => {
            console.log('🛍️ Pedidos actualizados globalmente');
            this.updateSyncIndicator();
        });
        
        // Escuchar eventos de notificaciones
        window.addEventListener('negocioVecino_orderCreated', (e) => {
            this.handleNewOrderNotification(e.detail);
        });
        
        console.log('👂 Event listeners globales configurados');
    }
    
    handleNewOrderNotification(orderData) {
        // Actualizar badge de notificaciones
        if (window.notificationSystem) {
            const unreadCount = window.notificationSystem.getUnreadCount(
                window.notificationSystem.getCurrentUserType()
            );
            
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'block' : 'none';
            }
        }
    }
    
    // ===== MEJORAS ELEMENTOS EXISTENTES =====
    enhanceExistingElements() {
        // Mejorar búsqueda con debounce
        this.enhanceSearchInput();
        
        // Agregar tooltips informativos
        this.addTooltips();
        
        // Mejorar navegación entre pestañas
        this.enhanceTabNavigation();
    }
    
    enhanceSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || searchInput._enhanced) return;
        
        // Agregar placeholder mejorado
        searchInput.placeholder = 'Buscar productos... (Ctrl+K)';
        
        // Agregar shortcut global
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        });
        
        searchInput._enhanced = true;
        console.log('🔍 Búsqueda mejorada');
    }
    
    addTooltips() {
        // Agregar tooltips a botones importantes
        const tooltips = [
            { selector: '#themeToggle', text: 'Cambiar tema (claro/oscuro)' },
            { selector: '#clearCart', text: 'Vaciar carrito completamente' },
            { selector: '#finalizarPedido', text: 'Proceder al pago' },
            { selector: '#gridView', text: 'Vista en cuadrícula' },
            { selector: '#listView', text: 'Vista en lista' }
        ];
        
        tooltips.forEach(({ selector, text }) => {
            const element = document.querySelector(selector);
            if (element && !element.title) {
                element.title = text;
            }
        });
        
        console.log('💡 Tooltips agregados');
    }
    
    enhanceTabNavigation() {
        // Agregar navegación con teclado en pestañas de negocio
        setTimeout(() => {
            const businessTabs = document.querySelectorAll('.business-tab');
            if (businessTabs.length === 0) return;
            
            businessTabs.forEach((tab, index) => {
                tab.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft' && index > 0) {
                        businessTabs[index - 1].focus();
                        businessTabs[index - 1].click();
                    } else if (e.key === 'ArrowRight' && index < businessTabs.length - 1) {
                        businessTabs[index + 1].focus();
                        businessTabs[index + 1].click();
                    }
                });
                
                // Hacer tabulable
                if (!tab.hasAttribute('tabindex')) {
                    tab.setAttribute('tabindex', '0');
                }
            });
            
            console.log('⌨️ Navegación de pestañas mejorada');
        }, 2000);
    }
    
    // ===== UTILIDADES =====
    updateSyncIndicator() {
        const indicator = document.getElementById('syncIndicator');
        if (!indicator) return;
        
        const status = indicator.querySelector('.sync-status');
        const icon = status.querySelector('i');
        const text = status.querySelector('.sync-text');
        
        if (window.syncManager && window.realTimeConnector) {
            const syncStatus = window.syncManager.getSyncStatus();
            const connectionStatus = window.realTimeConnector.getConnectionStatus();
            
            if (connectionStatus.isConnected && syncStatus.isInitialized) {
                icon.className = 'fas fa-check-circle';
                text.textContent = 'Sincronizado';
                status.className = 'sync-status synced';
            } else {
                icon.className = 'fas fa-exclamation-triangle';
                text.textContent = 'Desconectado';
                status.className = 'sync-status disconnected';
            }
        } else {
            icon.className = 'fas fa-times-circle';
            text.textContent = 'Error';
            status.className = 'sync-status error';
        }
    }
    
    performManualSync() {
        const button = document.getElementById('manualSyncButton');
        if (!button) return;
        
        const icon = button.querySelector('i');
        const text = button.querySelector('span');
        
        // Animación de sincronización
        icon.className = 'fas fa-sync fa-spin';
        text.textContent = 'Sincronizando...';
        button.disabled = true;
        
        // Forzar sincronización
        if (window.realTimeConnector) {
            window.realTimeConnector.forceSyncNow();
        }
        
        if (window.syncManager) {
            window.syncManager.forceSyncAll();
        }
        
        // Restaurar botón después de 2 segundos
        setTimeout(() => {
            icon.className = 'fas fa-sync';
            text.textContent = 'Sincronizar';
            button.disabled = false;
            
            this.showToast('Sincronización manual completada', 'success');
        }, 2000);
    }
    
    showIntegrationStatus() {
        const readySystems = Object.values(this.integrationStatus).filter(Boolean).length;
        const totalSystems = Object.keys(this.integrationStatus).length;
        
        console.log(`✅ Integración completada: ${readySystems}/${totalSystems} sistemas`);
        
        if (readySystems === totalSystems) {
            this.showToast('Todos los sistemas conectados correctamente', 'success');
        } else {
            this.showToast(`${readySystems}/${totalSystems} sistemas conectados`, 'warning');
        }
        
        // Mostrar detalles en consola
        console.table(this.integrationStatus);
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
    
    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }
    
    // ===== ESTILOS GLOBALES =====
    injectGlobalStyles() {
        if (document.getElementById('integrationStyles')) return;
        
        const styles = `
            <style id="integrationStyles">
                /* INDICADOR DE SINCRONIZACIÓN */
                .sync-indicator {
                    display: flex;
                    align-items: center;
                    margin-left: 15px;
                }
                
                .sync-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .sync-status.synced {
                    background: rgba(39, 174, 96, 0.1);
                    color: #27ae60;
                }
                
                .sync-status.disconnected {
                    background: rgba(243, 156, 18, 0.1);
                    color: #f39c12;
                }
                
                .sync-status.error {
                    background: rgba(231, 76, 60, 0.1);
                    color: #e74c3c;
                }
                
                /* BOTÓN DE NOTIFICACIONES */
                .notification-button {
                    position: relative;
                    background: none;
                    border: 2px solid var(--border-color, #e9ecef);
                    border-radius: 12px;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--text-secondary, #7f8c8d);
                    margin-right: 8px;
                }
                
                .notification-button:hover {
                    background: var(--primary-color, #e67e22);
                    color: white;
                    transform: scale(1.05);
                }
                
                .notification-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                /* BOTÓN DE SINCRONIZACIÓN MANUAL */
                .sync-tab {
                    background: rgba(52, 152, 219, 0.1) !important;
                    color: #3498db !important;
                    border-left: 3px solid #3498db;
                }
                
                .sync-tab:hover {
                    background: rgba(52, 152, 219, 0.2) !important;
                }
                
                .sync-tab:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                /* MEJORAS GENERALES */
                .config-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                
                .config-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                /* MODAL DEBUG */
                .debug-modal .modal-content {
                    max-width: 800px;
                }
                
                .debug-modal pre {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                /* RESPONSIVE */
                @media (max-width: 768px) {
                    .sync-indicator {
                        margin-left: 10px;
                    }
                    
                    .sync-status {
                        font-size: 10px;
                        padding: 2px 6px;
                    }
                    
                    .notification-button {
                        width: 40px;
                        height: 40px;
                        margin-right: 6px;
                    }
                    
                    .sync-tab span {
                        display: none;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
        console.log('🎨 Estilos de integración inyectados');
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    // Crear instancia global
    window.scriptIntegration = new ScriptIntegration();
    
    // Funciones helper globales
    window.getIntegrationStatus = () => {
        return window.scriptIntegration.integrationStatus;
    };
    
    window.manualSync = () => {
        if (window.scriptIntegration) {
            window.scriptIntegration.performManualSync();
        }
    };
    
    console.log('🔧 ScriptIntegration disponible globalmente');
}

console.log('🔧 ScriptIntegration v1.0.1 CORREGIDO cargado - Funciones: getIntegrationStatus(), manualSync(), etc.');