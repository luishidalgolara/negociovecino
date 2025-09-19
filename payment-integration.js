// ===== INTEGRACIÓN DE SISTEMA DE PAGOS CON NEGOCIO VECINO - ACTUALIZADO =====
// Archivo: payment-integration.js
// Versión: 2.0.0 - CON BOLETAS DIGITALES
// Descripción: Conecta todos los sistemas (pago, notificaciones, estados, boletas) con la app principal

class PaymentIntegration {
    constructor() {
        this.version = '2.0.0';
        this.paymentSimulator = null;
        this.notificationSystem = null;
        this.orderStatusManager = null;
        this.digitalReceiptGenerator = null; // NUEVO: Generador de boletas
        this.isInitialized = false;
        
        // Esperar a que estén disponibles todos los sistemas
        this.waitForSystems();
        
        console.log(`🔗 PaymentIntegration v${this.version} inicializando con boletas digitales...`);
    }
    
    // ===== INICIALIZACIÓN =====
    waitForSystems() {
        const checkSystems = () => {
            if (window.PaymentSimulator && 
                window.notificationSystem && 
                window.orderStatusManager && 
                window.digitalReceiptGenerator) { // NUEVO: Verificar boletas
                    
                this.paymentSimulator = window.PaymentSimulator;
                this.notificationSystem = window.notificationSystem;
                this.orderStatusManager = window.orderStatusManager;
                this.digitalReceiptGenerator = window.digitalReceiptGenerator; // NUEVO
                this.initialize();
            } else {
                setTimeout(checkSystems, 100);
            }
        };
        checkSystems();
    }
    
    initialize() {
        // Inyectar botón de pago en el modal existente
        this.injectPaymentButton();
        
        // Inyectar botón "RECIBIDO" en panel admin
        this.injectReceivedButton();
        
        // Configurar eventos
        this.setupIntegrationEvents();
        
        // Interceptar función original de procesamiento
        this.interceptOriginalProcessing();
        
        // Crear interfaz global
        this.createGlobalInterface();
        
        this.isInitialized = true;
        console.log('✅ PaymentIntegration inicializado correctamente con boletas digitales');
    }
    
    // ===== INYECCIÓN DE BOTÓN DE PAGO =====
    injectPaymentButton() {
        // Buscar el modal de pedido existente
        const modalPedido = document.getElementById('modalPedido');
        if (!modalPedido) {
            console.warn('⚠️ Modal de pedido no encontrado');
            return;
        }
        
        // Buscar el botón "Confirmar Pedido" existente
        const confirmarBtn = document.getElementById('confirmarPedido');
        if (!confirmarBtn) {
            console.warn('⚠️ Botón confirmar pedido no encontrado');
            return;
        }
        
        // Modificar el botón existente para que active el pago
        const originalOnClick = confirmarBtn.onclick;
        confirmarBtn.onclick = null;
        
        // Cambiar texto y funcionalidad
        confirmarBtn.innerHTML = `
            <i class="fas fa-credit-card"></i>
            <span>Proceder al Pago</span>
            <div class="btn-ripple"></div>
        `;
        
        // Nueva funcionalidad: abrir modal de pago
        confirmarBtn.addEventListener('click', () => {
            this.showPaymentModal();
        });
        
        console.log('💳 Botón de pago inyectado');
    }
    
    // ===== MODAL DE PAGO =====
    showPaymentModal() {
        // Validar datos del pedido primero
        const validation = this.validateOrderData();
        if (!validation.isValid) {
            this.showToast(validation.message, 'error');
            return;
        }
        
        // Crear modal de pago dinámicamente
        this.createPaymentModal();
        this.showModal('paymentModal');
    }
    
    createPaymentModal() {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('paymentModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal payment-modal';
        
        // Obtener datos del pedido actual
        const orderData = this.getOrderDataFromModal();
        
        modal.innerHTML = `
            <div class="modal-content payment-modal-content">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-credit-card"></i>
                        Confirmar Pago
                    </h3>
                    <button class="modal-close payment-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <h4>
                            <i class="fas fa-receipt"></i>
                            Resumen del Pedido
                        </h4>
                        <div class="summary-details">
                            <div class="summary-row">
                                <span>Cliente:</span>
                                <span>${orderData.nombreCliente}</span>
                            </div>
                            <div class="summary-row">
                                <span>Hora de retiro:</span>
                                <span>${orderData.horaRetiro}</span>
                            </div>
                            <div class="summary-row">
                                <span>Método de pago:</span>
                                <span>${this.getPaymentMethodText(orderData.metodoPago)}</span>
                            </div>
                            <div class="summary-row total-row">
                                <span><strong>Total a pagar:</strong></span>
                                <span class="total-amount"><strong>$${this.formatPrice(orderData.total)}</strong></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-method-selection">
                        <h4>
                            <i class="fas fa-wallet"></i>
                            Confirma tu método de pago
                        </h4>
                        <div class="payment-methods">
                            <label class="payment-method-option">
                                <input type="radio" name="finalPaymentMethod" value="efectivo" ${orderData.metodoPago === 'efectivo' ? 'checked' : ''}>
                                <div class="payment-method-card">
                                    <div class="payment-method-icon">
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                    <div class="payment-method-info">
                                        <strong>Efectivo</strong>
                                        <p>Pagar al retirar el pedido</p>
                                    </div>
                                </div>
                            </label>
                            
                            <label class="payment-method-option">
                                <input type="radio" name="finalPaymentMethod" value="tarjeta_credito">
                                <div class="payment-method-card">
                                    <div class="payment-method-icon">
                                        <i class="fas fa-credit-card"></i>
                                    </div>
                                    <div class="payment-method-info">
                                        <strong>Tarjeta de Crédito</strong>
                                        <p>Pago simulado (modo prueba)</p>
                                    </div>
                                </div>
                            </label>
                            
                            <label class="payment-method-option">
                                <input type="radio" name="finalPaymentMethod" value="tarjeta_debito">
                                <div class="payment-method-card">
                                    <div class="payment-method-icon">
                                        <i class="fas fa-credit-card"></i>
                                    </div>
                                    <div class="payment-method-info">
                                        <strong>Tarjeta de Débito</strong>
                                        <p>Pago simulado (modo prueba)</p>
                                    </div>
                                </div>
                            </label>
                            
                            <label class="payment-method-option">
                                <input type="radio" name="finalPaymentMethod" value="transferencia">
                                <div class="payment-method-card">
                                    <div class="payment-method-icon">
                                        <i class="fas fa-university"></i>
                                    </div>
                                    <div class="payment-method-info">
                                        <strong>Transferencia</strong>
                                        <p>Pago simulado (modo prueba)</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="payment-test-notice">
                        <i class="fas fa-info-circle"></i>
                        <p><strong>Modo Prueba:</strong> Este es un simulador de pago. No se procesarán pagos reales.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="paymentIntegration.closePaymentModal()">
                        <i class="fas fa-arrow-left"></i>
                        Volver
                    </button>
                    <button type="button" id="btnProcessPayment" class="btn-success btn-large">
                        <i class="fas fa-credit-card"></i>
                        <span>Confirmar y Pagar</span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos del modal de pago
        this.setupPaymentModalEvents();
        
        // Inyectar estilos específicos
        this.injectPaymentModalStyles();
    }
    
    setupPaymentModalEvents() {
        // Botón procesar pago
        document.getElementById('btnProcessPayment')?.addEventListener('click', () => {
            this.processOrderPayment();
        });
        
        // Cerrar modal
        document.querySelector('.payment-modal-close')?.addEventListener('click', () => {
            this.closePaymentModal();
        });
        
        // Cerrar al hacer click fuera
        document.getElementById('paymentModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'paymentModal') {
                this.closePaymentModal();
            }
        });
        
        // Actualizar método de pago seleccionado
        document.querySelectorAll('input[name="finalPaymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('.payment-method-option').forEach(option => {
                    option.classList.toggle('selected', option.querySelector('input').checked);
                });
            });
        });
        
        // Marcar método inicial como seleccionado
        const checkedRadio = document.querySelector('input[name="finalPaymentMethod"]:checked');
        if (checkedRadio) {
            checkedRadio.closest('.payment-method-option').classList.add('selected');
        }
    }
    
    // ===== PROCESAMIENTO DE PAGO ACTUALIZADO CON BOLETAS =====
    async processOrderPayment() {
        try {
            // Obtener método de pago seleccionado
            const selectedMethod = document.querySelector('input[name="finalPaymentMethod"]:checked')?.value;
            if (!selectedMethod) {
                this.showToast('Selecciona un método de pago', 'error');
                return;
            }
            
            // Obtener datos del pedido
            const orderData = this.getOrderDataFromModal();
            
            // Crear pedido en el sistema de estados
            const order = this.orderStatusManager.createOrder(orderData);
            
            // Transicionar a "esperando pago"
            this.orderStatusManager.transitionToPayment(order.id);
            
            // Datos para el simulador de pago
            const paymentData = {
                method: selectedMethod,
                amount: orderData.total,
                orderId: order.id,
                customerName: orderData.nombreCliente
            };
            
            // Procesar pago con el simulador
            const paymentResult = await this.paymentSimulator.processPayment(paymentData);
            
            if (paymentResult.success) {
                // Pago exitoso - NUEVO: Generar boleta digital
                await this.handleSuccessfulPayment(order, paymentResult);
            } else {
                // Pago fallido
                await this.handleFailedPayment(order, paymentResult);
            }
            
        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            this.showToast('Error procesando el pago. Intenta nuevamente.', 'error');
        }
    }
    
    // ===== MANEJO DE PAGO EXITOSO - ACTUALIZADO CON BOLETAS =====
    async handleSuccessfulPayment(order, paymentResult) {
        // Actualizar estado a "pagado"
        this.orderStatusManager.transitionToPaid(order.id, paymentResult);
        
        // NUEVO: Generar boleta digital
        const digitalReceipt = this.digitalReceiptGenerator.createDigitalReceipt(order.orderData, paymentResult);
        console.log('🎫 Boleta digital generada:', digitalReceipt.number);
        
        // Enviar notificaciones
        this.notificationSystem.notifyOrderCreated(order.orderData);
        this.notificationSystem.notifyOrderPaid(order.orderData, paymentResult);
        
        // Cerrar modal de pago
        this.closePaymentModal();
        
        // Cerrar modal de pedido original
        this.closeOriginalModal();
        
        // NUEVO: Mostrar boleta digital en lugar del modal de éxito básico
        this.showDigitalReceipt(digitalReceipt);
        
        // Limpiar carrito original
        this.clearOriginalCart();
        
        // Actualizar panel de admin si está activo
        this.refreshAdminPanel();
        
        console.log('✅ Pago procesado exitosamente con boleta:', paymentResult.transactionId);
    }
    
    async handleFailedPayment(order, paymentResult) {
        // Cancelar pedido
        this.orderStatusManager.transitionToCancelled(order.id, paymentResult.error);
        
        // Mostrar error
        this.showToast(`Error en el pago: ${paymentResult.error}`, 'error');
        
        console.log('❌ Pago fallido:', paymentResult.errorCode);
    }
    
    // ===== NUEVA FUNCIÓN: MOSTRAR BOLETA DIGITAL =====
    showDigitalReceipt(receipt) {
        // Usar el generador de boletas para mostrar la boleta
        this.digitalReceiptGenerator.showDigitalReceipt(receipt);
        
        // Toast de confirmación adicional
        setTimeout(() => {
            this.showToast(`¡Boleta digital generada! Número: ${receipt.number}`, 'success');
        }, 1000);
    }
    
    // ===== BOTÓN "RECIBIDO" PARA ADMIN =====
    injectReceivedButton() {
        // Esta función se ejecutará cuando se rendericen los pedidos en el panel admin
        // Se conectará con el sistema existente mediante eventos
        
        // Escuchar cuando se rendericen pedidos
        document.addEventListener('pedidosRendered', () => {
            this.addReceivedButtonsToPedidos();
        });
        
        // También verificar periódicamente por nuevos pedidos
        setInterval(() => {
            this.addReceivedButtonsToPedidos();
        }, 2000);
    }
    
    addReceivedButtonsToPedidos() {
        // Buscar tarjetas de pedidos que necesiten botones
        const pedidoCards = document.querySelectorAll('.pedido-card');
        
        pedidoCards.forEach(card => {
            // Buscar el ID del pedido
            const pedidoHeader = card.querySelector('.pedido-header h4');
            if (!pedidoHeader) return;
            
            const pedidoIdMatch = pedidoHeader.textContent.match(/Pedido #(\d+)/);
            if (!pedidoIdMatch) return;
            
            const pedidoId = parseInt(pedidoIdMatch[1]);
            const order = this.orderStatusManager.getOrder(pedidoId);
            if (!order) return;
            
            const actionsContainer = card.querySelector('.pedido-actions');
            if (!actionsContainer) return;
            
            // NUEVO: Agregar botón "EDITAR" para pedidos pagados
            if ((order.status === 'paid' || order.status === 'received') && !card.querySelector('.btn-edit-order')) {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn-primary btn-warning btn-edit-order';
                editBtn.innerHTML = `
                    <i class="fas fa-edit"></i>
                    EDITAR
                `;
                
                editBtn.addEventListener('click', () => {
                    if (window.orderRefundManager) {
                        window.orderRefundManager.showEditOrderModal(pedidoId);
                    }
                });
                
                actionsContainer.appendChild(editBtn);
            }
            
            // Botón RECIBIDO solo para pedidos pagados
            if (order.status === 'paid' && !card.querySelector('.btn-received')) {
                const receivedBtn = document.createElement('button');
                receivedBtn.className = 'btn-primary btn-success btn-received';
                receivedBtn.innerHTML = `
                    <i class="fas fa-inbox"></i>
                    RECIBIDO
                `;
                
                receivedBtn.addEventListener('click', () => {
                    this.markOrderAsReceived(pedidoId, card);
                });
                
                // Agregar al inicio de las acciones
                actionsContainer.insertBefore(receivedBtn, actionsContainer.firstChild);
            }
        });
    }
    
    markOrderAsReceived(pedidoId, cardElement) {
        // Confirmar acción
        if (!confirm('¿Confirmas que has recibido este pedido?')) {
            return;
        }
        
        // Actualizar estado
        const order = this.orderStatusManager.transitionToReceived(pedidoId);
        
        if (order) {
            // Enviar notificación al cliente
            this.notificationSystem.notifyOrderReceived(pedidoId, order.customerData);
            
            // Actualizar UI de la tarjeta
            this.updatePedidoCardUI(cardElement, order);
            
            // Toast de confirmación
            this.showToast('Pedido marcado como recibido', 'success');
            
            console.log(`📥 Pedido ${pedidoId} marcado como recibido`);
        }
    }
    
    updatePedidoCardUI(cardElement, order) {
        // Actualizar estado visual de la tarjeta
        const statusElement = cardElement.querySelector('.pedido-status');
        if (statusElement) {
            statusElement.textContent = 'Recibido';
            statusElement.className = 'pedido-status received';
        }
        
        // Remover botón "RECIBIDO" y agregar nuevas acciones
        const receivedBtn = cardElement.querySelector('.btn-received');
        if (receivedBtn) {
            receivedBtn.remove();
        }
        
        // Agregar botones de siguiente paso
        const actionsContainer = cardElement.querySelector('.pedido-actions');
        if (actionsContainer) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn-primary btn-success';
            confirmBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Confirmar`;
            confirmBtn.addEventListener('click', () => {
                this.confirmOrder(order.id, cardElement);
            });
            
            const rejectBtn = document.createElement('button');
            rejectBtn.className = 'btn-primary btn-danger';
            rejectBtn.innerHTML = `<i class="fas fa-ban"></i> Rechazar`;
            rejectBtn.addEventListener('click', () => {
                this.rejectOrder(order.id, cardElement);
            });
            
            actionsContainer.appendChild(confirmBtn);
            actionsContainer.appendChild(rejectBtn);
        }
    }
    
    confirmOrder(pedidoId, cardElement) {
        const estimatedTime = prompt('Tiempo estimado de preparación (ej: 30 minutos):') || '30 minutos';
        
        const order = this.orderStatusManager.transitionToConfirmed(pedidoId, estimatedTime);
        
        if (order) {
            this.notificationSystem.notifyOrderConfirmed(pedidoId, order.customerData, estimatedTime);
            this.showToast('Pedido confirmado', 'success');
            
            // Actualizar UI
            const statusElement = cardElement.querySelector('.pedido-status');
            if (statusElement) {
                statusElement.textContent = 'Confirmado';
                statusElement.className = 'pedido-status confirmado';
            }
        }
    }
    
    rejectOrder(pedidoId, cardElement) {
        const reason = prompt('Motivo del rechazo:') || 'Sin especificar';
        
        const order = this.orderStatusManager.transitionToRejected(pedidoId, reason);
        
        if (order) {
            this.showToast('Pedido rechazado', 'warning');
            
            // Actualizar UI
            const statusElement = cardElement.querySelector('.pedido-status');
            if (statusElement) {
                statusElement.textContent = 'Rechazado';
                statusElement.className = 'pedido-status rechazado';
            }
            
            // Remover acciones
            const actionsContainer = cardElement.querySelector('.pedido-actions');
            if (actionsContainer) {
                actionsContainer.innerHTML = '';
            }
        }
    }
    
    // ===== INTERCEPTORES =====
    interceptOriginalProcessing() {
        // Interceptar la función original procesarPedido si existe
        if (typeof window.procesarPedido === 'function') {
            const originalFunction = window.procesarPedido;
            
            window.procesarPedido = () => {
                console.log('🔄 Redirigiendo a nuevo sistema de pago...');
                this.showPaymentModal();
            };
            
            console.log('🔒 Función procesarPedido interceptada');
        }
    }
    
    // ===== UTILIDADES =====
    validateOrderData() {
        // Validaciones básicas del pedido
        const nombreCliente = document.getElementById('nombreCliente')?.value?.trim();
        const horaRetiro = document.getElementById('horaRetiro')?.value;
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked')?.value;
        
        if (!nombreCliente) {
            return { isValid: false, message: 'Ingresa tu nombre' };
        }
        
        if (!horaRetiro) {
            return { isValid: false, message: 'Selecciona una hora de retiro' };
        }
        
        if (!metodoPago) {
            return { isValid: false, message: 'Selecciona un método de pago' };
        }
        
        // Verificar que hay items en el carrito
        if (!window.carrito || window.carrito.length === 0) {
            return { isValid: false, message: 'El carrito está vacío' };
        }
        
        return { isValid: true, message: 'Validación exitosa' };
    }
    
    getOrderDataFromModal() {
        // Obtener datos del modal actual
        const nombreCliente = document.getElementById('nombreCliente')?.value?.trim() || '';
        const telefonoCliente = document.getElementById('telefonoCliente')?.value?.trim() || '';
        const horaRetiro = document.getElementById('horaRetiro')?.value || '';
        const comentarios = document.getElementById('comentarios')?.value?.trim() || '';
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked')?.value || 'efectivo';
        
        // Calcular totales del carrito actual
        const subtotal = window.carrito ? window.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) : 0;
        const descuento = (window.descuentoAplicado || 0) * subtotal;
        const total = subtotal - descuento;
        
        return {
            id: Date.now(), // ID temporal, se reemplazará
            nombreCliente,
            telefonoCliente,
            horaRetiro,
            comentarios,
            metodoPago,
            items: window.carrito ? [...window.carrito] : [],
            subtotal,
            descuento,
            total,
            codigoDescuentoActual: window.codigoDescuentoActual || '', // NUEVO: Para la boleta
            email: '' // NUEVO: Campo para futura funcionalidad
        };
    }
    
    getPaymentMethodText(method) {
        const methods = {
            'efectivo': 'Efectivo al retirar',
            'tarjeta': 'Tarjeta en tienda',
            'pagado': 'Ya pagado'
        };
        return methods[method] || method;
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
    
    // ===== MODALES =====
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.remove('active');
            modal.remove();
        }
        document.body.style.overflow = '';
    }
    
    closeOriginalModal() {
        // Cerrar modal de pedido original
        const modalPedido = document.getElementById('modalPedido');
        if (modalPedido) {
            modalPedido.classList.remove('active');
        }
    }
    
    // ===== LIMPIAR ESTADO ORIGINAL =====
    clearOriginalCart() {
        // Limpiar carrito original si existe
        if (window.carrito) {
            window.carrito = [];
        }
        
        if (window.updateCarrito) {
            window.updateCarrito();
        }
        
        // Resetear descuentos
        if (typeof window.descuentoAplicado !== 'undefined') {
            window.descuentoAplicado = 0;
        }
        
        if (typeof window.codigoDescuentoActual !== 'undefined') {
            window.codigoDescuentoActual = '';
        }
    }
    
    refreshAdminPanel() {
        // Refrescar panel de admin si está activo
        if (window.renderPedidos) {
            setTimeout(() => {
                window.renderPedidos();
                
                // Disparar evento para que se agreguen los botones
                document.dispatchEvent(new CustomEvent('pedidosRendered'));
            }, 1000);
        }
    }
    
    // ===== INTERFAZ GLOBAL ACTUALIZADA =====
    createGlobalInterface() {
        window.paymentIntegration = this;
        
        // Funciones helper globales
        window.processPaymentFlow = (orderData) => {
            return this.processOrderPayment(orderData);
        };
        
        window.markOrderReceived = (pedidoId) => {
            return this.markOrderAsReceived(pedidoId);
        };
        
        // NUEVO: Funciones para boletas
        window.generateDigitalReceiptFromOrder = (orderData, paymentResult) => {
            return this.digitalReceiptGenerator.createDigitalReceipt(orderData, paymentResult);
        };
        
        window.showReceiptByNumber = (receiptNumber) => {
            const receipt = this.digitalReceiptGenerator.getReceipt(receiptNumber);
            if (receipt) {
                this.digitalReceiptGenerator.showDigitalReceipt(receipt);
            }
        };
        
        console.log('🌐 PaymentIntegration disponible globalmente con boletas digitales');
    }
    
    // ===== EVENTOS =====
    setupIntegrationEvents() {
        // Escuchar cambios de estado de pedidos
        window.addEventListener('orderStatusChanged', (e) => {
            console.log('📋 Estado de pedido cambiado:', e.detail);
            
            // Refrescar UI si es necesario
            this.refreshAdminPanel();
        });
        
        // NUEVO: Escuchar cuando se genere una boleta
        window.addEventListener('digitalReceiptGenerated', (e) => {
            console.log('🎫 Boleta digital generada:', e.detail);
        });
    }
    
    // ===== UTILIDADES UI =====
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }
    
    // ===== ESTILOS =====
    injectPaymentModalStyles() {
        if (document.getElementById('paymentModalStyles')) return;
        
        const styles = `
            <style id="paymentModalStyles">
                .payment-modal-content {
                    max-width: 600px;
                }
                
                .payment-summary {
                    background: var(--bg-secondary, #f8f9fa);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    border: 1px solid var(--border-color, #e9ecef);
                }
                
                .payment-summary h4 {
                    color: var(--text-primary, #2c3e50);
                    margin: 0 0 16px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .summary-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                }
                
                .summary-row.total-row {
                    border-top: 2px solid var(--border-color, #e9ecef);
                    padding-top: 12px;
                    margin-top: 8px;
                }
                
                .total-amount {
                    color: #e67e22;
                    font-size: 1.25rem;
                }
                
                .payment-method-selection h4 {
                    color: var(--text-primary, #2c3e50);
                    margin: 0 0 16px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .payment-methods {
                    display: grid;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .payment-method-option {
                    cursor: pointer;
                    display: block;
                }
                
                .payment-method-option input {
                    display: none;
                }
                
                .payment-method-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border: 2px solid var(--border-color, #e9ecef);
                    border-radius: 12px;
                    background: var(--bg-card, #ffffff);
                    transition: all 0.3s ease;
                }
                
                .payment-method-option:hover .payment-method-card {
                    border-color: #e67e22;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(230, 126, 34, 0.15);
                }
                
                .payment-method-option.selected .payment-method-card {
                    border-color: #e67e22;
                    background: rgba(230, 126, 34, 0.05);
                    box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
                }
                
                .payment-method-icon {
                    width: 48px;
                    height: 48px;
                    background: #e67e22;
                    color: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .payment-method-info h5 {
                    margin: 0 0 4px 0;
                    color: var(--text-primary, #2c3e50);
                }
                
                .payment-method-info p {
                    margin: 0;
                    color: var(--text-secondary, #7f8c8d);
                    font-size: 14px;
                }
                
                .payment-test-notice {
                    background: rgba(52, 152, 219, 0.1);
                    border: 1px solid rgba(52, 152, 219, 0.3);
                    border-radius: 8px;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #3498db;
                    font-size: 14px;
                }
                
                @media (max-width: 768px) {
                    .payment-modal-content {
                        margin: 0;
                        max-height: 100vh;
                        border-radius: 0;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
if (typeof window !== 'undefined') {
    function initPaymentIntegration() {
        if (!window.paymentIntegration) {
            window.paymentIntegration = new PaymentIntegration();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPaymentIntegration);
    } else {
        setTimeout(initPaymentIntegration, 1000);
    }
}

console.log('🔗 Payment Integration v2.0.0 cargado con boletas digitales');