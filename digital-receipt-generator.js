// ===== GENERADOR DE BOLETAS DIGITALES =====
// Archivo: digital-receipt-generator.js
// Versión: 1.0.0
// Descripción: Genera boletas digitales para pagos procesados

class DigitalReceiptGenerator {
    constructor() {
        this.version = '1.0.0';
        this.storageKey = 'negocioVecino_digital_receipts';
        this.receipts = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        this.receiptCounter = this.getLastReceiptNumber() + 1;
        
        // Información del negocio
        this.businessInfo = {
            name: 'Negocio Vecino',
            address: 'Tu Barrio, Ciudad',
            phone: '+56 9 1234 5678',
            email: 'contacto@negociovecino.cl',
            rut: '12.345.678-9',
            website: 'www.negociovecino.cl'
        };
        
        console.log(`🎫 DigitalReceiptGenerator v${this.version} inicializado`);
        this.injectReceiptStyles();
    }
    
    // ===== GENERAR BOLETA =====
    createDigitalReceipt(orderData, paymentResult) {
        const receipt = {
            // Información básica
            number: this.generateReceiptNumber(),
            orderId: orderData.id,
            date: new Date().toISOString(),
            
            // Información del cliente
            customer: {
                name: orderData.nombreCliente,
                phone: orderData.telefonoCliente || '',
                email: orderData.email || ''
            },
            
            // Información del pedido
            order: {
                pickupTime: orderData.horaRetiro,
                comments: orderData.comentarios || '',
                items: [...orderData.items]
            },
            
            // Información financiera
            financial: {
                subtotal: orderData.subtotal,
                discount: orderData.descuento || 0,
                discountCode: orderData.codigoDescuentoActual || '',
                total: orderData.total,
                paymentMethod: this.getPaymentMethodText(paymentResult.method),
                currency: 'CLP'
            },
            
            // Información del pago
            payment: {
                transactionId: paymentResult.transactionId,
                authorizationCode: paymentResult.authorizationCode || '',
                timestamp: paymentResult.timestamp,
                processor: paymentResult.processor || 'SimuladorPago',
                status: 'completed'
            },
            
            // Información del negocio
            business: { ...this.businessInfo },
            
            // Metadatos
            metadata: {
                generatedAt: new Date().toISOString(),
                version: this.version,
                format: 'digital',
                hash: this.generateReceiptHash()
            }
        };
        
        // Guardar boleta
        this.saveReceipt(receipt);
        
        // Emitir evento
        this.emitReceiptGenerated(receipt);
        
        console.log(`🎫 Boleta digital generada: ${receipt.number}`);
        return receipt;
    }
    
    // ===== MOSTRAR BOLETA =====
    showDigitalReceipt(receipt) {
        // Crear modal de boleta
        this.createReceiptModal(receipt);
        this.showModal('digitalReceiptModal');
        
        // Agregar a historial si no existe
        if (!this.receipts.find(r => r.number === receipt.number)) {
            this.saveReceipt(receipt);
        }
    }
    
    createReceiptModal(receipt) {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('digitalReceiptModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'digitalReceiptModal';
        modal.className = 'modal receipt-modal';
        
        const receiptHtml = this.generateReceiptHTML(receipt);
        
        modal.innerHTML = `
            <div class="modal-content receipt-modal-content">
                <div class="modal-header receipt-header">
                    <h3>
                        <i class="fas fa-receipt"></i>
                        Boleta Digital
                    </h3>
                    <button class="modal-close receipt-modal-close">&times;</button>
                </div>
                <div class="modal-body receipt-body">
                    ${receiptHtml}
                </div>
                <div class="modal-footer receipt-footer">
                    <button type="button" class="btn-secondary" onclick="digitalReceiptGenerator.downloadReceipt('${receipt.number}')">
                        <i class="fas fa-download"></i>
                        Descargar PDF
                    </button>
                    <button type="button" class="btn-secondary" onclick="digitalReceiptGenerator.shareReceipt('${receipt.number}')">
                        <i class="fas fa-share"></i>
                        Compartir
                    </button>
                    <button type="button" class="btn-primary" onclick="digitalReceiptGenerator.closeReceiptModal()">
                        <i class="fas fa-check"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupReceiptModalEvents();
    }
    
    generateReceiptHTML(receipt) {
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString('es-CL');
        };
        
        const formatPrice = (price) => {
            return new Intl.NumberFormat('es-CL').format(price);
        };
        
        return `
            <div class="digital-receipt">
                <!-- Header del negocio -->
                <div class="receipt-business-header">
                    <div class="business-logo">
                        <i class="fas fa-store"></i>
                    </div>
                    <div class="business-info">
                        <h2>${receipt.business.name}</h2>
                        <p>${receipt.business.address}</p>
                        <p>Tel: ${receipt.business.phone}</p>
                        <p>RUT: ${receipt.business.rut}</p>
                    </div>
                </div>
                
                <!-- Información de la boleta -->
                <div class="receipt-info">
                    <div class="receipt-number">
                        <strong>BOLETA ELECTRÓNICA Nº ${receipt.number}</strong>
                    </div>
                    <div class="receipt-date">
                        Fecha: ${formatDate(receipt.date)}
                    </div>
                </div>
                
                <!-- Información del cliente -->
                <div class="receipt-customer">
                    <h4>Datos del Cliente</h4>
                    <p><strong>Nombre:</strong> ${receipt.customer.name}</p>
                    ${receipt.customer.phone ? `<p><strong>Teléfono:</strong> ${receipt.customer.phone}</p>` : ''}
                    ${receipt.customer.email ? `<p><strong>Email:</strong> ${receipt.customer.email}</p>` : ''}
                    <p><strong>Hora de retiro:</strong> ${receipt.order.pickupTime}</p>
                </div>
                
                <!-- Detalles del pedido -->
                <div class="receipt-items">
                    <h4>Detalle del Pedido</h4>
                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receipt.order.items.map(item => `
                                <tr>
                                    <td>
                                        <div class="item-name">${item.nombre}</div>
                                        <div class="item-weight">${item.peso}</div>
                                    </td>
                                    <td class="text-center">${item.cantidad}</td>
                                    <td class="text-right">$${formatPrice(item.precio)}</td>
                                    <td class="text-right">$${formatPrice(item.precio * item.cantidad)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Totales -->
                <div class="receipt-totals">
                    <div class="total-line">
                        <span>Subtotal:</span>
                        <span>$${formatPrice(receipt.financial.subtotal)}</span>
                    </div>
                    ${receipt.financial.discount > 0 ? `
                        <div class="total-line discount">
                            <span>Descuento ${receipt.financial.discountCode ? `(${receipt.financial.discountCode})` : ''}:</span>
                            <span>-$${formatPrice(receipt.financial.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-line final">
                        <strong>
                            <span>TOTAL:</span>
                            <span>$${formatPrice(receipt.financial.total)}</span>
                        </strong>
                    </div>
                </div>
                
                <!-- Información del pago -->
                <div class="receipt-payment">
                    <h4>Información del Pago</h4>
                    <div class="payment-details">
                        <div class="payment-row">
                            <span>Método de pago:</span>
                            <span>${receipt.financial.paymentMethod}</span>
                        </div>
                        <div class="payment-row">
                            <span>ID Transacción:</span>
                            <span>${receipt.payment.transactionId}</span>
                        </div>
                        ${receipt.payment.authorizationCode ? `
                            <div class="payment-row">
                                <span>Código autorización:</span>
                                <span>${receipt.payment.authorizationCode}</span>
                            </div>
                        ` : ''}
                        <div class="payment-row">
                            <span>Fecha de pago:</span>
                            <span>${formatDate(receipt.payment.timestamp)}</span>
                        </div>
                        <div class="payment-row">
                            <span>Estado:</span>
                            <span class="payment-status-success">PAGADO</span>
                        </div>
                    </div>
                </div>
                
                ${receipt.order.comments ? `
                    <div class="receipt-comments">
                        <h4>Comentarios</h4>
                        <p>${receipt.order.comments}</p>
                    </div>
                ` : ''}
                
                <!-- Footer -->
                <div class="receipt-footer">
                    <div class="receipt-thanks">
                        <strong>¡Gracias por tu compra!</strong>
                        <p>Tu pedido estará listo a la hora acordada</p>
                    </div>
                    <div class="receipt-metadata">
                        <p><small>Boleta generada digitalmente el ${formatDate(receipt.metadata.generatedAt)}</small></p>
                        <p><small>Hash: ${receipt.metadata.hash}</small></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===== GESTIÓN DE BOLETAS =====
    saveReceipt(receipt) {
        // Agregar al inicio del array
        this.receipts.unshift(receipt);
        
        // Mantener solo las últimas 100 boletas
        if (this.receipts.length > 100) {
            this.receipts = this.receipts.slice(0, 100);
        }
        
        // Guardar en localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(this.receipts));
        
        console.log(`💾 Boleta ${receipt.number} guardada`);
    }
    
    getReceipt(receiptNumber) {
        return this.receipts.find(r => r.number === receiptNumber);
    }
    
    getAllReceipts() {
        return [...this.receipts];
    }
    
    getReceiptsByCustomer(customerName) {
        return this.receipts.filter(r => 
            r.customer.name.toLowerCase().includes(customerName.toLowerCase())
        );
    }
    
    getReceiptsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.receipts.filter(r => {
            const receiptDate = new Date(r.date);
            return receiptDate >= start && receiptDate <= end;
        });
    }
    
    // ===== FUNCIONES AUXILIARES =====
    generateReceiptNumber() {
        const number = this.receiptCounter.toString().padStart(8, '0');
        this.receiptCounter++;
        return `BE-${number}`;
    }
    
    getLastReceiptNumber() {
        if (this.receipts.length === 0) return 0;
        
        const lastReceipt = this.receipts[0];
        const numberMatch = lastReceipt.number.match(/BE-(\d+)/);
        return numberMatch ? parseInt(numberMatch[1]) : 0;
    }
    
    generateReceiptHash() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return btoa(timestamp + random).substring(0, 16);
    }
    
    getPaymentMethodText(method) {
        const methods = {
            'efectivo': 'Efectivo',
            'tarjeta_credito': 'Tarjeta de Crédito',
            'tarjeta_debito': 'Tarjeta de Débito',
            'transferencia': 'Transferencia Bancaria'
        };
        return methods[method] || method;
    }
    
    // ===== EXPORTAR/COMPARTIR =====
    downloadReceipt(receiptNumber) {
        const receipt = this.getReceipt(receiptNumber);
        if (!receipt) {
            this.showToast('Boleta no encontrada', 'error');
            return;
        }
        
        // Generar HTML para impresión
        const printHtml = this.generatePrintableHTML(receipt);
        
        // Crear ventana de impresión
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printHtml);
        printWindow.document.close();
        
        // Enfocar y abrir diálogo de impresión
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
        console.log(`🖨️ Boleta ${receiptNumber} enviada a impresión`);
    }
    
    shareReceipt(receiptNumber) {
        const receipt = this.getReceipt(receiptNumber);
        if (!receipt) {
            this.showToast('Boleta no encontrada', 'error');
            return;
        }
        
        // Generar texto para compartir
        const shareText = this.generateShareText(receipt);
        
        // Usar Web Share API si está disponible
        if (navigator.share) {
            navigator.share({
                title: `Boleta ${receipt.number}`,
                text: shareText,
                url: window.location.href
            }).then(() => {
                console.log('📤 Boleta compartida exitosamente');
            }).catch(err => {
                console.log('❌ Error compartiendo:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }
    
    generatePrintableHTML(receipt) {
        const receiptHtml = this.generateReceiptHTML(receipt);
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Boleta ${receipt.number}</title>
                <style>
                    ${this.getPrintStyles()}
                </style>
            </head>
            <body>
                ${receiptHtml}
            </body>
            </html>
        `;
    }
    
    generateShareText(receipt) {
        const formatPrice = (price) => new Intl.NumberFormat('es-CL').format(price);
        
        return `🎫 Boleta Digital ${receipt.number}
🏪 ${receipt.business.name}
👤 Cliente: ${receipt.customer.name}
💰 Total: $${formatPrice(receipt.financial.total)}
📅 ${new Date(receipt.date).toLocaleDateString('es-CL')}
🆔 Transacción: ${receipt.payment.transactionId}`;
    }
    
    fallbackShare(text) {
        // Copiar al portapapeles
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Información de boleta copiada al portapapeles', 'success');
            });
        } else {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('Información de boleta copiada al portapapeles', 'success');
            } catch (err) {
                this.showToast('No se pudo copiar la información', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    // ===== MODAL =====
    setupReceiptModalEvents() {
        // Cerrar modal
        document.querySelector('.receipt-modal-close')?.addEventListener('click', () => {
            this.closeReceiptModal();
        });
        
        // Cerrar al hacer click fuera
        document.getElementById('digitalReceiptModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'digitalReceiptModal') {
                this.closeReceiptModal();
            }
        });
        
        // Tecla ESC para cerrar
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeReceiptModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeReceiptModal() {
        const modal = document.getElementById('digitalReceiptModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        document.body.style.overflow = '';
    }
    
    // ===== EVENTOS =====
    emitReceiptGenerated(receipt) {
        const event = new CustomEvent('digitalReceiptGenerated', {
            detail: { receipt, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    // ===== UTILIDADES =====
    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }
    
    // ===== ESTADÍSTICAS =====
    getReceiptStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayReceipts = this.receipts.filter(r => {
            const receiptDate = new Date(r.date);
            receiptDate.setHours(0, 0, 0, 0);
            return receiptDate.getTime() === today.getTime();
        });
        
        const totalToday = todayReceipts.reduce((sum, r) => sum + r.financial.total, 0);
        
        return {
            totalReceipts: this.receipts.length,
            todayReceipts: todayReceipts.length,
            totalAmountToday: totalToday,
            lastReceiptNumber: this.receipts[0]?.number || 'Ninguna'
        };
    }
    
    // ===== ESTILOS =====
    injectReceiptStyles() {
        if (document.getElementById('receiptStyles')) return;
        
        const styles = `
            <style id="receiptStyles">
                .receipt-modal-content {
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .digital-receipt {
                    font-family: 'Courier New', monospace;
                    background: white;
                    color: #333;
                    line-height: 1.4;
                }
                
                .receipt-business-header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                
                .business-logo {
                    font-size: 3rem;
                    color: #e67e22;
                    margin-bottom: 10px;
                }
                
                .business-info h2 {
                    margin: 0 0 10px 0;
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .business-info p {
                    margin: 2px 0;
                    font-size: 14px;
                }
                
                .receipt-info {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .receipt-number {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .receipt-customer,
                .receipt-items,
                .receipt-payment,
                .receipt-comments {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                
                .receipt-customer h4,
                .receipt-items h4,
                .receipt-payment h4,
                .receipt-comments h4 {
                    margin: 0 0 10px 0;
                    font-size: 1.1rem;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                
                .receipt-table th,
                .receipt-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                
                .receipt-table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                
                .receipt-table .text-center {
                    text-align: center;
                }
                
                .receipt-table .text-right {
                    text-align: right;
                }
                
                .item-name {
                    font-weight: bold;
                }
                
                .item-weight {
                    font-size: 12px;
                    color: #666;
                }
                
                .receipt-totals {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                
                .total-line {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
                
                .total-line.discount {
                    color: #e67e22;
                }
                
                .total-line.final {
                    border-top: 2px solid #333;
                    margin-top: 10px;
                    padding-top: 10px;
                    font-size: 1.2rem;
                }
                
                .payment-details {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .payment-row {
                    display: flex;
                    justify-content: space-between;
                }
                
                .payment-status-success {
                    color: #27ae60;
                    font-weight: bold;
                }
                
                .receipt-footer {
                    text-align: center;
                    border-top: 2px solid #333;
                    padding-top: 20px;
                    margin-top: 20px;
                }
                
                .receipt-thanks {
                    margin-bottom: 15px;
                }
                
                .receipt-thanks strong {
                    font-size: 1.2rem;
                    color: #e67e22;
                }
                
                .receipt-metadata {
                    color: #666;
                }
                
                .receipt-metadata p {
                    margin: 5px 0;
                }
                
                @media print {
                    .modal-header,
                    .modal-footer {
                        display: none;
                    }
                    
                    .digital-receipt {
                        box-shadow: none;
                    }
                }
                
                @media (max-width: 768px) {
                    .receipt-modal-content {
                        margin: 0;
                        max-height: 100vh;
                        border-radius: 0;
                    }
                    
                    .digital-receipt {
                        font-size: 14px;
                    }
                    
                    .receipt-table {
                        font-size: 12px;
                    }
                    
                    .payment-row {
                        flex-direction: column;
                        gap: 2px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    getPrintStyles() {
        return `
            body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                margin: 0;
                padding: 20px;
            }
            
            .digital-receipt {
                max-width: none;
            }
            
            .receipt-table {
                page-break-inside: avoid;
            }
            
            .receipt-footer {
                page-break-inside: avoid;
            }
        `;
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    window.digitalReceiptGenerator = new DigitalReceiptGenerator();
    
    // Funciones helper globales
    window.generateDigitalReceipt = (orderData, paymentResult) => {
        return window.digitalReceiptGenerator.createDigitalReceipt(orderData, paymentResult);
    };
    
    window.showDigitalReceipt = (receipt) => {
        window.digitalReceiptGenerator.showDigitalReceipt(receipt);
    };
    
    window.findReceipt = (receiptNumber) => {
        return window.digitalReceiptGenerator.getReceipt(receiptNumber);
    };
    
    console.log('🎫 DigitalReceiptGenerator disponible globalmente');
}

console.log('🎫 DigitalReceiptGenerator v1.0.0 cargado - Funciones: generateDigitalReceipt(), showDigitalReceipt(), etc.');