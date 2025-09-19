// ===== GESTOR DE REEMBOLSOS Y EDICIÓN DE PEDIDOS =====
// Archivo: order-refund-manager.js
// Versión: 1.0.0
// Descripción: Maneja edición de pedidos pagados y procesamiento de reembolsos

class OrderRefundManager {
    constructor() {
        this.version = '1.0.0';
        this.storageKey = 'negocioVecino_refunds';
        this.refunds = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        this.refundCounter = this.getLastRefundNumber() + 1;
        
        console.log(`💸 OrderRefundManager v${this.version} inicializado`);
        this.injectRefundStyles();
    }
    
    // ===== EDITAR PEDIDO =====
    showEditOrderModal(orderId) {
        const order = this.getOrderById(orderId);
        if (!order) {
            this.showToast('Pedido no encontrado', 'error');
            return;
        }
        
        if (order.status !== 'paid' && order.status !== 'received') {
            this.showToast('Solo se pueden editar pedidos pagados', 'warning');
            return;
        }
        
        this.createEditOrderModal(order);
        this.showModal('editOrderModal');
    }
    
    createEditOrderModal(order) {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('editOrderModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'editOrderModal';
        modal.className = 'modal edit-order-modal';
        
        modal.innerHTML = `
            <div class="modal-content edit-order-modal-content">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-edit"></i>
                        Editar Pedido #${order.id}
                    </h3>
                    <button class="modal-close edit-order-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.generateEditOrderHTML(order)}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="orderRefundManager.closeEditOrderModal()">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                    <button type="button" class="btn-primary" onclick="orderRefundManager.saveOrderChanges(${order.id})">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupEditOrderModalEvents();
    }
    
    generateEditOrderHTML(order) {
        const formatPrice = (price) => new Intl.NumberFormat('es-CL').format(price);
        
        return `
            <div class="edit-order-container">
                <!-- Información del cliente -->
                <div class="edit-section">
                    <h4><i class="fas fa-user"></i> Información del Cliente</h4>
                    <div class="form-group">
                        <label>Nombre:</label>
                        <input type="text" id="editCustomerName" value="${order.orderData.nombreCliente}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Teléfono:</label>
                        <input type="tel" id="editCustomerPhone" value="${order.orderData.telefonoCliente || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Hora de retiro:</label>
                        <input type="time" id="editPickupTime" value="${order.orderData.horaRetiro}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Comentarios:</label>
                        <textarea id="editComments" class="form-control" rows="3">${order.orderData.comentarios || ''}</textarea>
                    </div>
                </div>
                
                <!-- Items del pedido -->
                <div class="edit-section">
                    <h4><i class="fas fa-shopping-cart"></i> Productos del Pedido</h4>
                    <div id="editOrderItems" class="edit-order-items">
                        ${order.orderData.items.map((item, index) => this.generateEditItemHTML(item, index)).join('')}
                    </div>
                    <button type="button" class="btn-secondary btn-add-item" onclick="orderRefundManager.showAddItemModal(${order.id})">
                        <i class="fas fa-plus"></i>
                        Agregar Producto
                    </button>
                </div>
                
                <!-- Resumen financiero -->
                <div class="edit-section">
                    <h4><i class="fas fa-calculator"></i> Resumen Financiero</h4>
                    <div class="financial-summary">
                        <div class="summary-row">
                            <span>Subtotal original:</span>
                            <span>$${formatPrice(order.orderData.subtotal)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Descuento original:</span>
                            <span>-$${formatPrice(order.orderData.descuento || 0)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Total original:</span>
                            <span><strong>$${formatPrice(order.orderData.total)}</strong></span>
                        </div>
                        <hr>
                        <div class="summary-row" id="newSubtotal">
                            <span>Nuevo subtotal:</span>
                            <span>$${formatPrice(order.orderData.subtotal)}</span>
                        </div>
                        <div class="summary-row" id="newTotal">
                            <span><strong>Nuevo total:</strong></span>
                            <span><strong>$${formatPrice(order.orderData.total)}</strong></span>
                        </div>
                        <div class="summary-row" id="refundAmount" style="display: none;">
                            <span style="color: #e74c3c;"><strong>Reembolso requerido:</strong></span>
                            <span style="color: #e74c3c;"><strong>$0</strong></span>
                        </div>
                        <div class="summary-row" id="additionalAmount" style="display: none;">
                            <span style="color: #27ae60;"><strong>Pago adicional:</strong></span>
                            <span style="color: #27ae60;"><strong>$0</strong></span>
                        </div>
                    </div>
                </div>
                
                <!-- Motivo del cambio -->
                <div class="edit-section">
                    <h4><i class="fas fa-comment"></i> Motivo del Cambio</h4>
                    <div class="form-group">
                        <textarea id="editReason" class="form-control" rows="3" placeholder="Describe el motivo de la modificación del pedido..."></textarea>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateEditItemHTML(item, index) {
        const formatPrice = (price) => new Intl.NumberFormat('es-CL').format(price);
        
        return `
            <div class="edit-item" data-index="${index}">
                <div class="item-info">
                    <div class="item-name">${item.nombre}</div>
                    <div class="item-weight">${item.peso}</div>
                    <div class="item-price">$${formatPrice(item.precio)} c/u</div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button type="button" class="quantity-btn" onclick="orderRefundManager.changeItemQuantity(${index}, -1)">-</button>
                        <input type="number" class="quantity-input" id="itemQty${index}" value="${item.cantidad}" min="0" max="99" onchange="orderRefundManager.updateItemQuantity(${index})">
                        <button type="button" class="quantity-btn" onclick="orderRefundManager.changeItemQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="item-subtotal" id="itemSubtotal${index}">
                        $${formatPrice(item.precio * item.cantidad)}
                    </div>
                    <button type="button" class="btn-remove-item" onclick="orderRefundManager.removeItem(${index})" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    // ===== MANEJO DE ITEMS =====
    changeItemQuantity(itemIndex, change) {
        const input = document.getElementById(`itemQty${itemIndex}`);
        if (!input) return;
        
        const currentValue = parseInt(input.value);
        const newValue = Math.max(0, currentValue + change);
        input.value = newValue;
        
        this.updateItemQuantity(itemIndex);
    }
    
    updateItemQuantity(itemIndex) {
        const input = document.getElementById(`itemQty${itemIndex}`);
        const subtotalElement = document.getElementById(`itemSubtotal${itemIndex}`);
        
        if (!input || !subtotalElement) return;
        
        const quantity = parseInt(input.value) || 0;
        const itemElement = document.querySelector(`[data-index="${itemIndex}"]`);
        const priceText = itemElement.querySelector('.item-price').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        
        const subtotal = price * quantity;
        subtotalElement.textContent = `$${this.formatPrice(subtotal)}`;
        
        // Actualizar totales
        this.updateOrderTotals();
    }
    
    removeItem(itemIndex) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        
        const itemElement = document.querySelector(`[data-index="${itemIndex}"]`);
        if (itemElement) {
            itemElement.remove();
            this.updateOrderTotals();
        }
    }
    
    updateOrderTotals() {
        const items = document.querySelectorAll('.edit-item');
        let newSubtotal = 0;
        
        items.forEach(item => {
            const subtotalText = item.querySelector('.item-subtotal').textContent;
            const subtotal = parseInt(subtotalText.replace(/[^0-9]/g, ''));
            newSubtotal += subtotal;
        });
        
        // Obtener total original
        const originalTotal = this.getCurrentEditingOrder()?.orderData.total || 0;
        
        // Calcular diferencia
        const difference = newSubtotal - originalTotal;
        
        // Actualizar elementos
        document.getElementById('newSubtotal').querySelector('span:last-child').textContent = `$${this.formatPrice(newSubtotal)}`;
        document.getElementById('newTotal').querySelector('span:last-child').textContent = `$${this.formatPrice(newSubtotal)}`;
        
        // Mostrar reembolso o pago adicional
        const refundElement = document.getElementById('refundAmount');
        const additionalElement = document.getElementById('additionalAmount');
        
        if (difference < 0) {
            // Reembolso requerido
            refundElement.style.display = 'flex';
            refundElement.querySelector('span:last-child').textContent = `$${this.formatPrice(Math.abs(difference))}`;
            additionalElement.style.display = 'none';
        } else if (difference > 0) {
            // Pago adicional requerido
            additionalElement.style.display = 'flex';
            additionalElement.querySelector('span:last-child').textContent = `$${this.formatPrice(difference)}`;
            refundElement.style.display = 'none';
        } else {
            // Sin cambios
            refundElement.style.display = 'none';
            additionalElement.style.display = 'none';
        }
    }
    
    // ===== GUARDAR CAMBIOS =====
    saveOrderChanges(orderId) {
        const order = this.getOrderById(orderId);
        if (!order) {
            this.showToast('Pedido no encontrado', 'error');
            return;
        }
        
        // Recopilar datos del formulario
        const updatedData = this.collectFormData();
        const reason = document.getElementById('editReason')?.value?.trim();
        
        if (!reason) {
            this.showToast('Debe especificar un motivo para el cambio', 'warning');
            document.getElementById('editReason')?.focus();
            return;
        }
        
        // Calcular diferencia de precio
        const originalTotal = order.orderData.total;
        const newTotal = updatedData.total;
        const difference = newTotal - originalTotal;
        
        // Crear registro de modificación
        const modification = {
            orderId: orderId,
            timestamp: new Date().toISOString(),
            reason: reason,
            originalData: { ...order.orderData },
            updatedData: updatedData,
            difference: difference,
            modifiedBy: 'admin' // En el futuro podría incluir usuario específico
        };
        
        // Procesar cambio según la diferencia
        if (difference < 0) {
            // Reembolso requerido
            this.processRefund(order, Math.abs(difference), modification);
        } else if (difference > 0) {
            // Pago adicional requerido
            this.processAdditionalPayment(order, difference, modification);
        } else {
            // Solo cambios sin diferencia de precio
            this.updateOrderWithoutPaymentChange(order, updatedData, modification);
        }
    }
    
    collectFormData() {
        const items = [];
        const itemElements = document.querySelectorAll('.edit-item');
        
        itemElements.forEach((element, index) => {
            const quantity = parseInt(document.getElementById(`itemQty${index}`)?.value || 0);
            if (quantity > 0) {
                const nameElement = element.querySelector('.item-name');
                const weightElement = element.querySelector('.item-weight');
                const priceText = element.querySelector('.item-price').textContent;
                const price = parseInt(priceText.replace(/[^0-9]/g, ''));
                
                items.push({
                    id: Date.now() + index, // ID temporal
                    nombre: nameElement.textContent,
                    peso: weightElement.textContent,
                    precio: price,
                    cantidad: quantity
                });
            }
        });
        
        const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        return {
            nombreCliente: document.getElementById('editCustomerName')?.value?.trim() || '',
            telefonoCliente: document.getElementById('editCustomerPhone')?.value?.trim() || '',
            horaRetiro: document.getElementById('editPickupTime')?.value || '',
            comentarios: document.getElementById('editComments')?.value?.trim() || '',
            items: items,
            subtotal: subtotal,
            descuento: 0, // Para simplificar, no permitimos cambios de descuento
            total: subtotal
        };
    }
    
    // ===== PROCESAMIENTO DE REEMBOLSOS =====
    processRefund(order, refundAmount, modification) {
        const refund = {
            id: this.generateRefundId(),
            orderId: order.id,
            originalTransactionId: order.paymentResult?.transactionId,
            amount: refundAmount,
            reason: modification.reason,
            status: 'processed', // En un sistema real, sería 'pending'
            processedAt: new Date().toISOString(),
            method: order.paymentResult?.method || 'original_method',
            modification: modification
        };
        
        // Guardar reembolso
        this.saveRefund(refund);
        
        // Actualizar pedido
        this.updateOrder(order, modification.updatedData, modification);
        
        // Mostrar confirmación
        this.showRefundConfirmation(refund);
        
        console.log(`💸 Reembolso procesado: $${this.formatPrice(refundAmount)}`);
    }
    
    processAdditionalPayment(order, additionalAmount, modification) {
        // En un sistema real, aquí se procesaría el pago adicional
        // Por ahora, solo simulamos
        
        const additionalPayment = {
            id: this.generatePaymentId(),
            orderId: order.id,
            originalTransactionId: order.paymentResult?.transactionId,
            amount: additionalAmount,
            reason: modification.reason,
            status: 'completed',
            processedAt: new Date().toISOString(),
            method: 'same_method', // Usar el mismo método del pago original
            modification: modification
        };
        
        // Actualizar pedido
        this.updateOrder(order, modification.updatedData, modification);
        
        // Mostrar confirmación
        this.showAdditionalPaymentConfirmation(additionalPayment);
        
        console.log(`💳 Pago adicional procesado: $${this.formatPrice(additionalAmount)}`);
    }
    
    updateOrderWithoutPaymentChange(order, updatedData, modification) {
        // Solo actualizar datos del pedido
        this.updateOrder(order, updatedData, modification);
        
        this.showToast('Pedido actualizado correctamente', 'success');
        this.closeEditOrderModal();
        this.refreshOrderDisplays();
    }
    
    // ===== ACTUALIZACIÓN DE PEDIDOS =====
    updateOrder(order, updatedData, modification) {
        // Actualizar datos del pedido
        Object.assign(order.orderData, updatedData);
        
        // Agregar historial de modificaciones
        if (!order.modifications) {
            order.modifications = [];
        }
        order.modifications.push(modification);
        
        // Actualizar timestamp
        order.lastModified = new Date().toISOString();
        
        // Sincronizar si está disponible
        if (window.syncManager) {
            window.syncManager.syncOrderUpdated(order.id, {
                orderData: order.orderData,
                modifications: order.modifications,
                lastModified: order.lastModified
            });
        }
    }
    
    // ===== PERSISTENCIA =====
    saveRefund(refund) {
        this.refunds.unshift(refund);
        
        // Mantener solo los últimos 100 reembolsos
        if (this.refunds.length > 100) {
            this.refunds = this.refunds.slice(0, 100);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(this.refunds));
        console.log(`💾 Reembolso ${refund.id} guardado`);
    }
    
    // ===== CONFIRMACIONES =====
    showRefundConfirmation(refund) {
        const modal = this.createConfirmationModal(
            'Reembolso Procesado',
            `
                <div class="refund-confirmation">
                    <div class="confirmation-icon">
                        <i class="fas fa-undo"></i>
                    </div>
                    <h4>Reembolso de $${this.formatPrice(refund.amount)} procesado</h4>
                    <p><strong>ID del reembolso:</strong> ${refund.id}</p>
                    <p><strong>Método:</strong> ${this.getRefundMethodText(refund.method)}</p>
                    <p><strong>Estado:</strong> <span class="status-success">Procesado</span></p>
                    <div class="refund-notice">
                        <i class="fas fa-info-circle"></i>
                        <p>El reembolso será procesado en 3-5 días hábiles dependiendo del método de pago original.</p>
                    </div>
                </div>
            `,
            'success'
        );
        
        this.closeEditOrderModal();
        this.showModal(modal.id);
    }
    
    showAdditionalPaymentConfirmation(payment) {
        const modal = this.createConfirmationModal(
            'Pago Adicional Procesado',
            `
                <div class="payment-confirmation">
                    <div class="confirmation-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <h4>Pago adicional de $${this.formatPrice(payment.amount)} procesado</h4>
                    <p><strong>ID de transacción:</strong> ${payment.id}</p>
                    <p><strong>Método:</strong> ${this.getPaymentMethodText(payment.method)}</p>
                    <p><strong>Estado:</strong> <span class="status-success">Completado</span></p>
                    <div class="payment-notice">
                        <i class="fas fa-check-circle"></i>
                        <p>El pago adicional ha sido procesado exitosamente.</p>
                    </div>
                </div>
            `,
            'success'
        );
        
        this.closeEditOrderModal();
        this.showModal(modal.id);
    }
    
    createConfirmationModal(title, content, type) {
        const modalId = `confirmationModal_${Date.now()}`;
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal confirmation-modal';
        
        modal.innerHTML = `
            <div class="modal-content confirmation-modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-primary" onclick="orderRefundManager.closeConfirmationModal('${modalId}')">
                        <i class="fas fa-check"></i>
                        Entendido
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup close events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeConfirmationModal(modalId);
        });
        
        return modal;
    }
    
    // ===== UTILIDADES =====
    getOrderById(orderId) {
        // Intentar obtener del order status manager primero
        if (window.orderStatusManager) {
            return window.orderStatusManager.getOrder(orderId);
        }
        
        // Fallback: buscar en pedidos globales
        if (window.pedidos) {
            return window.pedidos.find(p => p.id === orderId);
        }
        
        return null;
    }
    
    getCurrentEditingOrder() {
        const modal = document.getElementById('editOrderModal');
        if (!modal) return null;
        
        const title = modal.querySelector('.modal-header h3').textContent;
        const orderIdMatch = title.match(/Pedido #(\d+)/);
        if (!orderIdMatch) return null;
        
        const orderId = parseInt(orderIdMatch[1]);
        return this.getOrderById(orderId);
    }
    
    generateRefundId() {
        const number = this.refundCounter.toString().padStart(6, '0');
        this.refundCounter++;
        return `REF-${number}`;
    }
    
    generatePaymentId() {
        return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
    
    getLastRefundNumber() {
        if (this.refunds.length === 0) return 0;
        
        const lastRefund = this.refunds[0];
        const numberMatch = lastRefund.id.match(/REF-(\d+)/);
        return numberMatch ? parseInt(numberMatch[1]) : 0;
    }
    
    getRefundMethodText(method) {
        const methods = {
            'original_method': 'Método de pago original',
            'bank_transfer': 'Transferencia bancaria',
            'cash': 'Efectivo'
        };
        return methods[method] || method;
    }
    
    getPaymentMethodText(method) {
        const methods = {
            'same_method': 'Mismo método original',
            'tarjeta_credito': 'Tarjeta de crédito',
            'tarjeta_debito': 'Tarjeta de débito',
            'efectivo': 'Efectivo'
        };
        return methods[method] || method;
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
    
    // ===== MODALES =====
    setupEditOrderModalEvents() {
        // Cerrar modal
        document.querySelector('.edit-order-modal-close')?.addEventListener('click', () => {
            this.closeEditOrderModal();
        });
        
        // Cerrar al hacer click fuera
        document.getElementById('editOrderModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'editOrderModal') {
                this.closeEditOrderModal();
            }
        });
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeEditOrderModal() {
        const modal = document.getElementById('editOrderModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        document.body.style.overflow = '';
    }
    
    closeConfirmationModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        document.body.style.overflow = '';
        
        // Refrescar displays
        this.refreshOrderDisplays();
    }
    
    refreshOrderDisplays() {
        // Refrescar vistas de pedidos
        if (typeof window.renderPedidos === 'function') {
            window.renderPedidos();
        }
        
        if (typeof window.updateAdminStats === 'function') {
            window.updateAdminStats();
        }
        
        // Disparar evento para que se actualicen los botones
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('pedidosRendered'));
        }, 100);
    }
    
    // ===== UTILIDADES UI =====
    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }
    
    // ===== API PÚBLICA =====
    getRefundStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayRefunds = this.refunds.filter(r => {
            const refundDate = new Date(r.processedAt);
            refundDate.setHours(0, 0, 0, 0);
            return refundDate.getTime() === today.getTime();
        });
        
        const totalTodayAmount = todayRefunds.reduce((sum, r) => sum + r.amount, 0);
        
        return {
            totalRefunds: this.refunds.length,
            todayRefunds: todayRefunds.length,
            totalAmountToday: totalTodayAmount,
            avgRefundAmount: this.refunds.length > 0 ? 
                this.refunds.reduce((sum, r) => sum + r.amount, 0) / this.refunds.length : 0
        };
    }
    
    // ===== ESTILOS =====
    injectRefundStyles() {
        if (document.getElementById('refundStyles')) return;
        
        const styles = `
            <style id="refundStyles">
                .edit-order-modal-content {
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .edit-order-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .edit-section {
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px;
                    background: #f8f9fa;
                }
                
                .edit-section h4 {
                    margin: 0 0 15px 0;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #2c3e50;
                }
                
                .form-control {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                .edit-order-items {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .edit-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                }
                
                .item-info {
                    flex: 1;
                }
                
                .item-name {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .item-weight {
                    font-size: 12px;
                    color: #6c757d;
                    margin-bottom: 4px;
                }
                
                .item-price {
                    font-size: 14px;
                    color: #e67e22;
                    font-weight: 500;
                }
                
                .item-controls {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .quantity-btn {
                    width: 30px;
                    height: 30px;
                    border: 1px solid #ced4da;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                
                .quantity-btn:hover {
                    background: #e9ecef;
                }
                
                .quantity-input {
                    width: 60px;
                    text-align: center;
                    padding: 4px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                }
                
                .item-subtotal {
                    font-weight: 600;
                    color: #2c3e50;
                    min-width: 80px;
                    text-align: right;
                }
                
                .btn-remove-item {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    width: 32px;
                    height: 32px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .btn-remove-item:hover {
                    background: #c0392b;
                }
                
                .btn-add-item {
                    align-self: flex-start;
                }
                
                .financial-summary {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #dee2e6;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f3f4;
                }
                
                .summary-row:last-child {
                    border-bottom: none;
                }
                
                .summary-row hr {
                    width: 100%;
                    margin: 10px 0;
                    border: none;
                    border-top: 2px solid #e9ecef;
                }
                
                .confirmation-modal-content {
                    max-width: 500px;
                }
                
                .refund-confirmation,
                .payment-confirmation {
                    text-align: center;
                    padding: 20px 0;
                }
                
                .confirmation-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                
                .refund-confirmation .confirmation-icon {
                    color: #e67e22;
                }
                
                .payment-confirmation .confirmation-icon {
                    color: #27ae60;
                }
                
                .refund-notice,
                .payment-notice {
                    background: #d1ecf1;
                    border: 1px solid #bee5eb;
                    border-radius: 6px;
                    padding: 12px;
                    margin-top: 15px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    text-align: left;
                }
                
                .refund-notice i,
                .payment-notice i {
                    color: #0c5460;
                    margin-top: 2px;
                }
                
                .status-success {
                    color: #27ae60;
                    font-weight: 600;
                }
                
                @media (max-width: 768px) {
                    .edit-order-modal-content {
                        margin: 0;
                        max-height: 100vh;
                        border-radius: 0;
                    }
                    
                    .edit-item {
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }
                    
                    .item-controls {
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .summary-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    window.orderRefundManager = new OrderRefundManager();
    
    // Funciones helper globales
    window.editOrder = (orderId) => {
        window.orderRefundManager.showEditOrderModal(orderId);
    };
    
    window.getRefundStats = () => {
        return window.orderRefundManager.getRefundStats();
    };
    
    console.log('💸 OrderRefundManager disponible globalmente');
}

console.log('💸 OrderRefundManager v1.0.0 cargado - Funciones: editOrder(), getRefundStats(), etc.');