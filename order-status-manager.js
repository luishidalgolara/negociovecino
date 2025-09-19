// ===== GESTOR DE ESTADOS DE PEDIDOS - ACTUALIZADO =====
// Archivo: order-status-manager.js
// Versión: 2.0.0 - CON DEVOLUCIONES
// Descripción: Manejo completo de estados y transiciones de pedidos + devoluciones

class OrderStatusManager {
    constructor() {
        this.version = '2.0.0';
        this.orders = JSON.parse(localStorage.getItem('negocioVecino_orderStatuses') || '[]');
        
        // Estados disponibles - ACTUALIZADOS
        this.statuses = {
            DRAFT: 'draft',                    // Borrador (en carrito)
            PENDING_PAYMENT: 'pending_payment', // Esperando pago
            PAID: 'paid',                      // Pagado
            RECEIVED: 'received',              // Recibido por dueño
            CONFIRMED: 'confirmed',            // Confirmado por dueño
            PREPARING: 'preparing',            // En preparación
            READY: 'ready',                    // Listo para retirar
            COMPLETED: 'completed',            // Completado/retirado
            CANCELLED: 'cancelled',            // Cancelado
            REJECTED: 'rejected',              // Rechazado
            // NUEVOS ESTADOS PARA DEVOLUCIONES
            ADJUSTED: 'adjusted',              // Pedido ajustado/editado
            PARTIAL_REFUND: 'partial_refund',  // Devolución parcial procesada
            REFUNDED: 'refunded'               // Completamente reembolsado
        };
        
        // Transiciones permitidas - ACTUALIZADAS
        this.allowedTransitions = {
            [this.statuses.DRAFT]: [this.statuses.PENDING_PAYMENT, this.statuses.CANCELLED],
            [this.statuses.PENDING_PAYMENT]: [this.statuses.PAID, this.statuses.CANCELLED],
            [this.statuses.PAID]: [this.statuses.RECEIVED, this.statuses.CANCELLED, this.statuses.ADJUSTED], // NUEVO: puede ir a ADJUSTED
            [this.statuses.RECEIVED]: [this.statuses.CONFIRMED, this.statuses.REJECTED, this.statuses.ADJUSTED], // NUEVO: puede ir a ADJUSTED
            [this.statuses.CONFIRMED]: [this.statuses.PREPARING, this.statuses.REJECTED, this.statuses.ADJUSTED], // NUEVO: puede ir a ADJUSTED
            [this.statuses.PREPARING]: [this.statuses.READY, this.statuses.REJECTED],
            [this.statuses.READY]: [this.statuses.COMPLETED, this.statuses.CANCELLED],
            [this.statuses.COMPLETED]: [], // Estado final
            [this.statuses.CANCELLED]: [], // Estado final
            [this.statuses.REJECTED]: [], // Estado final
            // NUEVAS TRANSICIONES
            [this.statuses.ADJUSTED]: [this.statuses.CONFIRMED, this.statuses.PARTIAL_REFUND, this.statuses.REFUNDED], // Después de ajustar
            [this.statuses.PARTIAL_REFUND]: [this.statuses.CONFIRMED, this.statuses.COMPLETED], // Después de devolución parcial
            [this.statuses.REFUNDED]: [] // Estado final
        };
        
        // Configuración de estados - ACTUALIZADA
        this.statusConfig = {
            [this.statuses.DRAFT]: {
                label: 'Borrador',
                description: 'Pedido en construcción',
                color: '#95a5a6',
                icon: 'edit',
                canCancel: true,
                showToCustomer: false
            },
            [this.statuses.PENDING_PAYMENT]: {
                label: 'Esperando Pago',
                description: 'Pedido creado, esperando confirmación de pago',
                color: '#f39c12',
                icon: 'credit-card',
                canCancel: true,
                showToCustomer: true
            },
            [this.statuses.PAID]: {
                label: 'Pagado',
                description: 'Pago confirmado, enviado al negocio',
                color: '#3498db',
                icon: 'check-circle',
                canCancel: true,
                showToCustomer: true,
                canEdit: true // NUEVO: Permite edición
            },
            [this.statuses.RECEIVED]: {
                label: 'Recibido',
                description: 'El negocio ha recibido el pedido',
                color: '#9b59b6',
                icon: 'inbox',
                canCancel: true,
                showToCustomer: true,
                canEdit: true // NUEVO: Permite edición
            },
            [this.statuses.CONFIRMED]: {
                label: 'Confirmado',
                description: 'Pedido confirmado por el negocio',
                color: '#2ecc71',
                icon: 'thumbs-up',
                canCancel: false,
                showToCustomer: true,
                canEdit: true // NUEVO: Permite edición
            },
            [this.statuses.PREPARING]: {
                label: 'Preparando',
                description: 'Pedido en preparación',
                color: '#e67e22',
                icon: 'cog',
                canCancel: false,
                showToCustomer: true
            },
            [this.statuses.READY]: {
                label: 'Listo',
                description: 'Pedido listo para retirar',
                color: '#27ae60',
                icon: 'bell',
                canCancel: false,
                showToCustomer: true
            },
            [this.statuses.COMPLETED]: {
                label: 'Completado',
                description: 'Pedido entregado/retirado',
                color: '#16a085',
                icon: 'check-double',
                canCancel: false,
                showToCustomer: true
            },
            [this.statuses.CANCELLED]: {
                label: 'Cancelado',
                description: 'Pedido cancelado',
                color: '#95a5a6',
                icon: 'times-circle',
                canCancel: false,
                showToCustomer: true
            },
            [this.statuses.REJECTED]: {
                label: 'Rechazado',
                description: 'Pedido rechazado por el negocio',
                color: '#e74c3c',
                icon: 'ban',
                canCancel: false,
                showToCustomer: true
            },
            // NUEVOS ESTADOS
            [this.statuses.ADJUSTED]: {
                label: 'Ajustado',
                description: 'Pedido modificado por disponibilidad',
                color: '#f39c12',
                icon: 'edit',
                canCancel: false,
                showToCustomer: true,
                canEdit: false // Ya fue editado
            },
            [this.statuses.PARTIAL_REFUND]: {
                label: 'Devolución Parcial',
                description: 'Parte del pago fue devuelto',
                color: '#fd79a8',
                icon: 'undo',
                canCancel: false,
                showToCustomer: true
            },
            [this.statuses.REFUNDED]: {
                label: 'Reembolsado',
                description: 'Pedido completamente reembolsado',
                color: '#e84393',
                icon: 'undo-alt',
                canCancel: false,
                showToCustomer: true
            }
        };
        
        console.log(`📋 OrderStatusManager v${this.version} inicializado con devoluciones`);
    }
    
    // ===== CREAR Y GESTIONAR PEDIDOS =====
    createOrder(orderData) {
        const order = {
            id: orderData.id,
            status: this.statuses.DRAFT,
            customerData: {
                nombre: orderData.nombreCliente,
                telefono: orderData.telefonoCliente,
                email: orderData.email || null
            },
            orderData: {
                items: orderData.items,
                subtotal: orderData.subtotal,
                descuento: orderData.descuento || 0,
                total: orderData.total,
                metodoPago: orderData.metodoPago,
                horaRetiro: orderData.horaRetiro,
                comentarios: orderData.comentarios || ''
            },
            paymentData: null,
            statusHistory: [{
                status: this.statuses.DRAFT,
                timestamp: new Date().toISOString(),
                note: 'Pedido creado',
                actor: 'cliente'
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // NUEVOS CAMPOS PARA DEVOLUCIONES
            isEdited: false,
            editedAt: null,
            refunds: [], // Historial de devoluciones
            totalRefunded: 0 // Total devuelto
        };
        
        this.orders.push(order);
        this.saveOrders();
        
        console.log(`📋 Pedido creado: ${order.id} - Estado: ${order.status}`);
        return order;
    }
    
    // ===== TRANSICIONES DE ESTADO EXISTENTES =====
    transitionToPayment(orderId) {
        return this.updateOrderStatus(orderId, this.statuses.PENDING_PAYMENT, {
            note: 'Pedido enviado para pago',
            actor: 'cliente'
        });
    }
    
    transitionToPaid(orderId, paymentData) {
        const order = this.updateOrderStatus(orderId, this.statuses.PAID, {
            note: 'Pago confirmado',
            actor: 'sistema'
        });
        
        if (order) {
            order.paymentData = paymentData;
            this.saveOrders();
        }
        
        return order;
    }
    
    transitionToReceived(orderId, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.RECEIVED, {
            note: 'Pedido recibido por el negocio',
            actor: 'dueño',
            actorName: actorData.name || 'Administrador'
        });
    }
    
    transitionToConfirmed(orderId, estimatedTime, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.CONFIRMED, {
            note: `Pedido confirmado - Tiempo estimado: ${estimatedTime}`,
            actor: 'dueño',
            actorName: actorData.name || 'Administrador',
            estimatedTime: estimatedTime
        });
    }
    
    transitionToPreparing(orderId, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.PREPARING, {
            note: 'Preparando pedido',
            actor: 'dueño',
            actorName: actorData.name || 'Administrador'
        });
    }
    
    transitionToReady(orderId, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.READY, {
            note: 'Pedido listo para retirar',
            actor: 'dueño',
            actorName: actorData.name || 'Administrador'
        });
    }
    
    transitionToCompleted(orderId, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.COMPLETED, {
            note: 'Pedido entregado/completado',
            actor: 'dueño',
            actorName: actorData.name || 'Administrador'
        });
    }
    
    transitionToCancelled(orderId, reason, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.CANCELLED, {
            note: `Pedido cancelado: ${reason}`,
            actor: actorData.actor || 'cliente',
            actorName: actorData.name || 'Cliente',
            reason: reason
        });
    }
    
    transitionToRejected(orderId, reason, actorData = {}) {
        return this.updateOrderStatus(orderId, this.statuses.REJECTED, {
            note: `Pedido rechazado: ${reason}`,
            actor: 'dueño',
            actorName: actorData.name || 'Administrador',
            reason: reason
        });
    }
    
    // ===== NUEVAS TRANSICIONES PARA DEVOLUCIONES =====
    transitionToAdjusted(orderId, adjustmentData, actorData = {}) {
        const order = this.updateOrderStatus(orderId, this.statuses.ADJUSTED, {
            note: `Pedido ajustado: ${adjustmentData.reason}`,
            actor: 'dueño',
            actorName: actorData.name || 'Administrador',
            adjustmentDetails: adjustmentData
        });
        
        if (order && adjustmentData.refundAmount > 0) {
            // Si hay devolución, transicionar a PARTIAL_REFUND
            setTimeout(() => {
                this.transitionToPartialRefund(orderId, adjustmentData, actorData);
            }, 100);
        }
        
        return order;
    }
    
    transitionToPartialRefund(orderId, refundData, actorData = {}) {
        const order = this.getOrder(orderId);
        if (!order) return null;
        
        // Agregar a historial de devoluciones
        if (!order.refunds) order.refunds = [];
        order.refunds.push({
            amount: refundData.refundAmount,
            reason: refundData.reason,
            timestamp: new Date().toISOString(),
            processedBy: actorData.name || 'Administrador',
            refundNumber: refundData.refundNumber || null
        });
        
        // Actualizar total devuelto
        order.totalRefunded = (order.totalRefunded || 0) + refundData.refundAmount;
        
        return this.updateOrderStatus(orderId, this.statuses.PARTIAL_REFUND, {
            note: `Devolución parcial procesada: $${refundData.refundAmount}`,
            actor: 'dueño',
            actorName: actorData.name || 'Administrador',
            refundAmount: refundData.refundAmount,
            refundReason: refundData.reason
        });
    }
    
    transitionToRefunded(orderId, refundData, actorData = {}) {
        const order = this.getOrder(orderId);
        if (!order) return null;
        
        // Agregar a historial de devoluciones
        if (!order.refunds) order.refunds = [];
        order.refunds.push({
            amount: refundData.refundAmount,
            reason: refundData.reason || 'Reembolso completo',
            timestamp: new Date().toISOString(),
            processedBy: actorData.name || 'Administrador',
            refundNumber: refundData.refundNumber || null
        });
        
        // Marcar como completamente reembolsado
        order.totalRefunded = order.orderData.total;
        
        return this.updateOrderStatus(orderId, this.statuses.REFUNDED, {
            note: `Pedido completamente reembolsado: $${refundData.refundAmount}`,
            actor: 'dueño',
            actorName: actorData.name || 'Administrador',
            refundAmount: refundData.refundAmount
        });
    }
    
    // ===== ACTUALIZACIÓN DE ESTADO GENÉRICA =====
    updateOrderStatus(orderId, newStatus, transitionData = {}) {
        const order = this.getOrder(orderId);
        if (!order) {
            console.error(`❌ Pedido no encontrado: ${orderId}`);
            return null;
        }
        
        // Verificar si la transición es válida
        if (!this.isValidTransition(order.status, newStatus)) {
            console.error(`❌ Transición inválida: ${order.status} -> ${newStatus}`);
            return null;
        }
        
        // Actualizar estado
        const oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        
        // Agregar a historial
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: transitionData.note || `Estado cambiado a ${this.getStatusLabel(newStatus)}`,
            actor: transitionData.actor || 'sistema',
            actorName: transitionData.actorName || null,
            ...transitionData
        });
        
        this.saveOrders();
        
        console.log(`📋 Estado actualizado - Pedido ${orderId}: ${oldStatus} -> ${newStatus}`);
        
        // Disparar evento de cambio de estado
        this.dispatchStatusChangeEvent(order, oldStatus, newStatus);
        
        return order;
    }
    
    // ===== NUEVAS FUNCIONES PARA DEVOLUCIONES =====
    updateOrderItems(orderId, newItems, totals) {
        const order = this.getOrder(orderId);
        if (!order) return null;
        
        // Guardar items originales si es la primera edición
        if (!order.originalOrderData) {
            order.originalOrderData = JSON.parse(JSON.stringify(order.orderData));
        }
        
        // Actualizar items y totales
        order.orderData.items = newItems;
        order.orderData.subtotal = totals.newSubtotal;
        order.orderData.total = totals.newTotal || totals.newSubtotal;
        
        // Marcar como editado
        order.isEdited = true;
        order.editedAt = new Date().toISOString();
        
        this.saveOrders();
        return order;
    }
    
    addRefundRecord(orderId, refundRecord) {
        const order = this.getOrder(orderId);
        if (!order) return null;
        
        if (!order.refunds) order.refunds = [];
        order.refunds.push(refundRecord);
        
        order.totalRefunded = (order.totalRefunded || 0) + refundRecord.amount;
        
        this.saveOrders();
        return order;
    }
    
    getTotalRefunded(orderId) {
        const order = this.getOrder(orderId);
        return order ? (order.totalRefunded || 0) : 0;
    }
    
    getRefundHistory(orderId) {
        const order = this.getOrder(orderId);
        return order ? (order.refunds || []) : [];
    }
    
    canEditOrder(orderId) {
        const order = this.getOrder(orderId);
        if (!order) return false;
        
        const config = this.statusConfig[order.status];
        return config ? (config.canEdit || false) : false;
    }
    
    // ===== VALIDACIONES ACTUALIZADAS =====
    isValidTransition(currentStatus, newStatus) {
        const allowedTransitions = this.allowedTransitions[currentStatus] || [];
        return allowedTransitions.includes(newStatus);
    }
    
    canTransitionTo(orderId, newStatus) {
        const order = this.getOrder(orderId);
        if (!order) return false;
        
        return this.isValidTransition(order.status, newStatus);
    }
    
    getAvailableTransitions(orderId) {
        const order = this.getOrder(orderId);
        if (!order) return [];
        
        return this.allowedTransitions[order.status] || [];
    }
    
    // ===== CONSULTAS =====
    getOrder(orderId) {
        return this.orders.find(order => order.id === orderId);
    }
    
    getOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }
    
    getOrdersByCustomer(customerName) {
        return this.orders.filter(order => 
            order.customerData.nombre.toLowerCase().includes(customerName.toLowerCase())
        );
    }
    
    getOrdersForOwner() {
        // Pedidos que el dueño debe ver (pagados en adelante)
        const visibleStatuses = [
            this.statuses.PAID,
            this.statuses.RECEIVED,
            this.statuses.CONFIRMED,
            this.statuses.PREPARING,
            this.statuses.READY,
            this.statuses.COMPLETED,
            this.statuses.REJECTED,
            this.statuses.ADJUSTED,      // NUEVO
            this.statuses.PARTIAL_REFUND, // NUEVO
            this.statuses.REFUNDED       // NUEVO
        ];
        
        return this.orders.filter(order => visibleStatuses.includes(order.status));
    }
    
    getOrdersForCustomer(customerName) {
        return this.orders.filter(order => 
            order.customerData.nombre === customerName &&
            this.statusConfig[order.status].showToCustomer
        );
    }
    
    // NUEVA: Obtener pedidos editables
    getEditableOrders() {
        return this.orders.filter(order => this.canEditOrder(order.id));
    }
    
    // ===== INFORMACIÓN DE ESTADOS =====
    getStatusLabel(status) {
        return this.statusConfig[status]?.label || status;
    }
    
    getStatusDescription(status) {
        return this.statusConfig[status]?.description || '';
    }
    
    getStatusColor(status) {
        return this.statusConfig[status]?.color || '#95a5a6';
    }
    
    getStatusIcon(status) {
        return this.statusConfig[status]?.icon || 'question';
    }
    
    canCancelOrder(orderId) {
        const order = this.getOrder(orderId);
        if (!order) return false;
        
        return this.statusConfig[order.status]?.canCancel || false;
    }
    
    // ===== ESTADÍSTICAS ACTUALIZADAS =====
    getOrderStats() {
        const stats = {};
        
        // Contar por estado
        Object.values(this.statuses).forEach(status => {
            stats[status] = this.getOrdersByStatus(status).length;
        });
        
        // Estadísticas adicionales
        stats.total = this.orders.length;
        stats.active = this.orders.filter(order => 
            ![this.statuses.COMPLETED, this.statuses.CANCELLED, this.statuses.REJECTED, this.statuses.REFUNDED].includes(order.status)
        ).length;
        
        // Revenue (pedidos completados)
        const completedOrders = this.getOrdersByStatus(this.statuses.COMPLETED);
        stats.totalRevenue = completedOrders.reduce((sum, order) => sum + order.orderData.total, 0);
        
        // NUEVAS ESTADÍSTICAS
        stats.editedOrders = this.orders.filter(order => order.isEdited).length;
        stats.totalRefunded = this.orders.reduce((sum, order) => sum + (order.totalRefunded || 0), 0);
        stats.ordersWithRefunds = this.orders.filter(order => (order.refunds || []).length > 0).length;
        
        return stats;
    }
    
    getStatsForToday() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        );
        
        return {
            todayOrders: todayOrders.length,
            todayRevenue: todayOrders
                .filter(order => order.status === this.statuses.COMPLETED)
                .reduce((sum, order) => sum + order.orderData.total, 0),
            pendingToday: todayOrders.filter(order => 
                [this.statuses.PAID, this.statuses.RECEIVED, this.statuses.CONFIRMED, this.statuses.PREPARING].includes(order.status)
            ).length,
            // NUEVAS ESTADÍSTICAS DEL DÍA
            todayRefunds: todayOrders.reduce((sum, order) => sum + (order.totalRefunded || 0), 0),
            todayAdjustments: todayOrders.filter(order => order.isEdited).length
        };
    }
    
    // ===== UTILIDADES DE UI =====
    createStatusBadge(status) {
        const config = this.statusConfig[status];
        if (!config) return null;
        
        const badge = document.createElement('span');
        badge.className = 'status-badge';
        badge.style.cssText = `
            background: ${config.color};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        `;
        
        badge.innerHTML = `
            <i class="fas fa-${config.icon}"></i>
            ${config.label}
        `;
        
        return badge;
    }
    
    createStatusTimeline(orderId) {
        const order = this.getOrder(orderId);
        if (!order) return null;
        
        const timeline = document.createElement('div');
        timeline.className = 'status-timeline';
        
        let timelineHTML = '';
        order.statusHistory.forEach((entry, index) => {
            const config = this.statusConfig[entry.status];
            const isLast = index === order.statusHistory.length - 1;
            
            timelineHTML += `
                <div class="timeline-item ${isLast ? 'active' : ''}">
                    <div class="timeline-icon" style="background: ${config.color}">
                        <i class="fas fa-${config.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">${config.label}</div>
                        <div class="timeline-note">${entry.note}</div>
                        <div class="timeline-time">
                            ${new Date(entry.timestamp).toLocaleString('es-CL')}
                            ${entry.actorName ? `- ${entry.actorName}` : ''}
                        </div>
                        ${entry.refundAmount ? `
                            <div class="timeline-refund">
                                💰 Devolución: $${this.formatPrice(entry.refundAmount)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        timeline.innerHTML = timelineHTML;
        return timeline;
    }
    
    // ===== ACCIONES RÁPIDAS PARA DUEÑO ACTUALIZADAS =====
    getOwnerActions(orderId) {
        const order = this.getOrder(orderId);
        if (!order) return [];
        
        const availableTransitions = this.getAvailableTransitions(orderId);
        const actions = [];
        
        // Acción de editar si el pedido lo permite
        if (this.canEditOrder(orderId)) {
            actions.push({
                type: 'edit',
                label: 'Editar Pedido',
                icon: 'edit',
                color: '#f39c12',
                action: () => {
                    if (window.orderRefundManager) {
                        window.orderRefundManager.showEditOrderModal(orderId);
                    }
                }
            });
        }
        
        availableTransitions.forEach(status => {
            switch (status) {
                case this.statuses.RECEIVED:
                    actions.push({
                        status: status,
                        label: 'Marcar como Recibido',
                        icon: 'inbox',
                        color: '#9b59b6',
                        action: () => this.transitionToReceived(orderId)
                    });
                    break;
                    
                case this.statuses.CONFIRMED:
                    actions.push({
                        status: status,
                        label: 'Confirmar Pedido',
                        icon: 'thumbs-up',
                        color: '#2ecc71',
                        action: (estimatedTime) => this.transitionToConfirmed(orderId, estimatedTime)
                    });
                    break;
                    
                case this.statuses.PREPARING:
                    actions.push({
                        status: status,
                        label: 'Comenzar Preparación',
                        icon: 'cog',
                        color: '#e67e22',
                        action: () => this.transitionToPreparing(orderId)
                    });
                    break;
                    
                case this.statuses.READY:
                    actions.push({
                        status: status,
                        label: 'Marcar como Listo',
                        icon: 'bell',
                        color: '#27ae60',
                        action: () => this.transitionToReady(orderId)
                    });
                    break;
                    
                case this.statuses.COMPLETED:
                    actions.push({
                        status: status,
                        label: 'Completar Pedido',
                        icon: 'check-double',
                        color: '#16a085',
                        action: () => this.transitionToCompleted(orderId)
                    });
                    break;
                    
                case this.statuses.REJECTED:
                    actions.push({
                        status: status,
                        label: 'Rechazar Pedido',
                        icon: 'ban',
                        color: '#e74c3c',
                        action: (reason) => this.transitionToRejected(orderId, reason)
                    });
                    break;
            }
        });
        
        return actions;
    }
    
    // ===== EVENTOS =====
    dispatchStatusChangeEvent(order, oldStatus, newStatus) {
        const event = new CustomEvent('orderStatusChanged', {
            detail: {
                order: order,
                oldStatus: oldStatus,
                newStatus: newStatus,
                timestamp: new Date().toISOString()
            }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
    }
    
    // ===== PERSISTENCIA =====
    saveOrders() {
        localStorage.setItem('negocioVecino_orderStatuses', JSON.stringify(this.orders));
    }
    
    // ===== EXPORTAR/IMPORTAR ACTUALIZADO =====
    exportOrders() {
        return {
            orders: this.orders,
            stats: this.getOrderStats(),
            refundStats: {
                totalRefunded: this.orders.reduce((sum, order) => sum + (order.totalRefunded || 0), 0),
                ordersWithRefunds: this.orders.filter(order => (order.refunds || []).length > 0).length,
                editedOrders: this.orders.filter(order => order.isEdited).length
            },
            exportedAt: new Date().toISOString()
        };
    }
    
    importOrders(data) {
        if (data.orders && Array.isArray(data.orders)) {
            this.orders = data.orders;
            this.saveOrders();
            return true;
        }
        return false;
    }
    
    // ===== LIMPIAR DATOS =====
    clearOldOrders(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        const initialCount = this.orders.length;
        this.orders = this.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate > cutoffDate || ![
                this.statuses.COMPLETED, 
                this.statuses.CANCELLED, 
                this.statuses.REJECTED,
                this.statuses.REFUNDED  // NUEVO
            ].includes(order.status);
        });
        
        const removedCount = initialCount - this.orders.length;
        
        if (removedCount > 0) {
            this.saveOrders();
            console.log(`🗑️ ${removedCount} pedidos antiguos eliminados`);
        }
        
        return removedCount;
    }
    
    // ===== UTILIDADES =====
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    window.orderStatusManager = new OrderStatusManager();
    console.log('📋 OrderStatusManager v2.0.0 disponible globalmente con devoluciones');
}

// ===== FUNCIONES HELPER ACTUALIZADAS =====
function createOrderWithStatus(orderData) {
    if (window.orderStatusManager) {
        return window.orderStatusManager.createOrder(orderData);
    }
}

function updateOrderStatus(orderId, newStatus, transitionData) {
    if (window.orderStatusManager) {
        return window.orderStatusManager.updateOrderStatus(orderId, newStatus, transitionData);
    }
}

function getOrderStatus(orderId) {
    if (window.orderStatusManager) {
        const order = window.orderStatusManager.getOrder(orderId);
        return order ? order.status : null;
    }
}

function markOrderAsReceived(orderId) {
    if (window.orderStatusManager) {
        return window.orderStatusManager.transitionToReceived(orderId);
    }
}

function getOrdersForOwnerPanel() {
    if (window.orderStatusManager) {
        return window.orderStatusManager.getOrdersForOwner();
    }
    return [];
}

// NUEVAS FUNCIONES HELPER
function canEditOrder(orderId) {
    if (window.orderStatusManager) {
        return window.orderStatusManager.canEditOrder(orderId);
    }
    return false;
}

function getOrderRefundHistory(orderId) {
    if (window.orderStatusManager) {
        return window.orderStatusManager.getRefundHistory(orderId);
    }
    return [];
}

function updateOrderAfterEdit(orderId, newItems, totals) {
    if (window.orderStatusManager) {
        return window.orderStatusManager.updateOrderItems(orderId, newItems, totals);
    }
}

console.log('📋 Order Status Manager v2.0.0 cargado con devoluciones - Funciones: createOrderWithStatus(), canEditOrder(), etc.');