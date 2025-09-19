// ===== SIMULADOR DE PAGO - MODO PRUEBA =====
// Archivo: payment-simulator.js
// Versión: 1.0.0
// Descripción: Simulador de pagos para testing - NO procesa pagos reales

class PaymentSimulator {
    constructor() {
        this.version = '1.0.0';
        this.isTestMode = true;
        this.processingTime = 2000; // 2 segundos de simulación
        
        // Configuración de respuestas simuladas
        this.successRate = 0.95; // 95% de éxito por defecto
        this.supportedMethods = [
            'efectivo',
            'tarjeta_credito', 
            'tarjeta_debito',
            'transferencia',
            'webpay'
        ];
        
        console.log(`💳 PaymentSimulator v${this.version} - MODO PRUEBA`);
    }
    
    // ===== PROCESAR PAGO SIMULADO =====
    async processPayment(paymentData) {
        console.log('💳 Iniciando simulación de pago...');
        
        // Validar datos de entrada
        const validation = this.validatePaymentData(paymentData);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error,
                errorCode: 'VALIDATION_ERROR'
            };
        }
        
        // Mostrar loading/procesando
        this.showProcessingUI();
        
        try {
            // Simular tiempo de procesamiento
            await this.simulateProcessingTime();
            
            // Simular respuesta del procesador de pagos
            const response = this.simulatePaymentResponse(paymentData);
            
            // Ocultar loading
            this.hideProcessingUI();
            
            return response;
            
        } catch (error) {
            this.hideProcessingUI();
            return {
                success: false,
                error: 'Error durante el procesamiento',
                errorCode: 'PROCESSING_ERROR'
            };
        }
    }
    
    // ===== VALIDACIÓN DE DATOS =====
    validatePaymentData(data) {
        const errors = [];
        
        // Método de pago requerido
        if (!data.method) {
            errors.push('Método de pago requerido');
        } else if (!this.supportedMethods.includes(data.method)) {
            errors.push('Método de pago no soportado');
        }
        
        // Monto requerido
        if (!data.amount || data.amount <= 0) {
            errors.push('Monto inválido');
        }
        
        // ID de pedido requerido
        if (!data.orderId) {
            errors.push('ID de pedido requerido');
        }
        
        // Validaciones específicas por método
        if (data.method === 'tarjeta_credito' || data.method === 'tarjeta_debito') {
            if (!data.cardData) {
                errors.push('Datos de tarjeta requeridos');
            }
        }
        
        return {
            isValid: errors.length === 0,
            error: errors.join(', ')
        };
    }
    
    // ===== SIMULACIÓN DE RESPUESTA =====
    simulatePaymentResponse(paymentData) {
        // Simular éxito/fallo basado en successRate
        const isSuccess = Math.random() < this.successRate;
        
        if (isSuccess) {
            return this.createSuccessResponse(paymentData);
        } else {
            return this.createErrorResponse(paymentData);
        }
    }
    
    createSuccessResponse(paymentData) {
        const transactionId = this.generateTransactionId();
        const authCode = this.generateAuthCode();
        
        return {
            success: true,
            transactionId: transactionId,
            authorizationCode: authCode,
            amount: paymentData.amount,
            method: paymentData.method,
            orderId: paymentData.orderId,
            timestamp: new Date().toISOString(),
            status: 'approved',
            message: 'Pago procesado exitosamente',
            receipt: {
                id: transactionId,
                date: new Date().toLocaleString('es-CL'),
                amount: paymentData.amount,
                method: this.getMethodDisplayName(paymentData.method),
                authCode: authCode
            }
        };
    }
    
    createErrorResponse(paymentData) {
        const errorCodes = [
            { code: 'INSUFFICIENT_FUNDS', message: 'Fondos insuficientes' },
            { code: 'CARD_DECLINED', message: 'Tarjeta rechazada' },
            { code: 'EXPIRED_CARD', message: 'Tarjeta vencida' },
            { code: 'INVALID_CARD', message: 'Tarjeta inválida' },
            { code: 'CONNECTION_ERROR', message: 'Error de conexión' }
        ];
        
        const randomError = errorCodes[Math.floor(Math.random() * errorCodes.length)];
        
        return {
            success: false,
            errorCode: randomError.code,
            error: randomError.message,
            orderId: paymentData.orderId,
            timestamp: new Date().toISOString(),
            status: 'declined'
        };
    }
    
    // ===== UTILIDADES =====
    generateTransactionId() {
        const prefix = 'TXN';
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}_${timestamp}_${random}`;
    }
    
    generateAuthCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    getMethodDisplayName(method) {
        const names = {
            'efectivo': 'Efectivo',
            'tarjeta_credito': 'Tarjeta de Crédito',
            'tarjeta_debito': 'Tarjeta de Débito', 
            'transferencia': 'Transferencia Bancaria',
            'webpay': 'WebPay'
        };
        return names[method] || method;
    }
    
    // ===== SIMULACIÓN DE TIEMPO =====
    async simulateProcessingTime() {
        return new Promise(resolve => {
            setTimeout(resolve, this.processingTime);
        });
    }
    
    // ===== UI DE PROCESAMIENTO =====
    showProcessingUI() {
        // Crear overlay de procesamiento
        const overlay = document.createElement('div');
        overlay.id = 'paymentProcessingOverlay';
        overlay.className = 'payment-processing-overlay';
        
        overlay.innerHTML = `
            <div class="payment-processing-content">
                <div class="payment-spinner"></div>
                <h3>Procesando Pago</h3>
                <p>Por favor espera mientras procesamos tu pago...</p>
                <div class="processing-steps">
                    <div class="step active">
                        <i class="fas fa-credit-card"></i>
                        <span>Validando datos</span>
                    </div>
                    <div class="step" id="step2">
                        <i class="fas fa-shield-alt"></i>
                        <span>Verificando seguridad</span>
                    </div>
                    <div class="step" id="step3">
                        <i class="fas fa-check-circle"></i>
                        <span>Confirmando pago</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animar pasos
        setTimeout(() => {
            document.getElementById('step2')?.classList.add('active');
        }, 700);
        
        setTimeout(() => {
            document.getElementById('step3')?.classList.add('active');
        }, 1400);
        
        // Inyectar estilos si no existen
        this.injectProcessingStyles();
    }
    
    hideProcessingUI() {
        const overlay = document.getElementById('paymentProcessingOverlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }
    
    injectProcessingStyles() {
        if (document.getElementById('paymentProcessingStyles')) return;
        
        const styles = `
            <style id="paymentProcessingStyles">
                .payment-processing-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .payment-processing-content {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                
                .payment-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #e67e22;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                .payment-processing-content h3 {
                    color: #2c3e50;
                    margin: 0 0 10px 0;
                    font-size: 1.5rem;
                }
                
                .payment-processing-content p {
                    color: #7f8c8d;
                    margin: 0 0 30px 0;
                }
                
                .processing-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .step {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 8px;
                    background: #f8f9fa;
                    color: #95a5a6;
                    transition: all 0.3s ease;
                }
                
                .step.active {
                    background: #e8f5e8;
                    color: #27ae60;
                }
                
                .step i {
                    width: 20px;
                    text-align: center;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // ===== MÉTODOS DE CONFIGURACIÓN =====
    setSuccessRate(rate) {
        this.successRate = Math.max(0, Math.min(1, rate));
        console.log(`💳 Success rate configurado a: ${this.successRate * 100}%`);
    }
    
    setProcessingTime(milliseconds) {
        this.processingTime = milliseconds;
        console.log(`💳 Tiempo de procesamiento: ${milliseconds}ms`);
    }
    
    // ===== MÉTODOS PARA TESTING =====
    simulateError() {
        this.successRate = 0; // Forzar error
    }
    
    simulateSuccess() {
        this.successRate = 1; // Forzar éxito
    }
    
    resetToDefault() {
        this.successRate = 0.95;
        this.processingTime = 2000;
    }
    
    // ===== INFORMACIÓN DEL SIMULADOR =====
    getSimulatorInfo() {
        return {
            version: this.version,
            isTestMode: this.isTestMode,
            successRate: this.successRate,
            processingTime: this.processingTime,
            supportedMethods: this.supportedMethods
        };
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    window.PaymentSimulator = new PaymentSimulator();
    console.log('💳 PaymentSimulator disponible globalmente');
}

// ===== FUNCIONES HELPER =====
async function simulatePayment(paymentData) {
    if (window.PaymentSimulator) {
        return await window.PaymentSimulator.processPayment(paymentData);
    } else {
        console.error('❌ PaymentSimulator no está disponible');
        return {
            success: false,
            error: 'Simulador de pago no disponible'
        };
    }
}

function configurePaymentSimulator(options = {}) {
    if (window.PaymentSimulator) {
        if (options.successRate) {
            window.PaymentSimulator.setSuccessRate(options.successRate);
        }
        if (options.processingTime) {
            window.PaymentSimulator.setProcessingTime(options.processingTime);
        }
    }
}

console.log('💳 Payment Simulator cargado - Funciones: simulatePayment(), configurePaymentSimulator()');