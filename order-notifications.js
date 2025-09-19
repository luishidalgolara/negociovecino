// ===== SISTEMA DE NOTIFICACIONES BIDIRECCIONALES =====
// Archivo: order-notifications.js
// Versión: 1.0.0
// Descripción: Comunicación cliente ↔ dueño para pedidos

class OrderNotificationSystem {
    constructor() {
        this.version = '1.0.0';
        this.notifications = JSON.parse(localStorage.getItem('negocioVecino_notifications') || '[]');
        this.subscribers = {};
        this.soundEnabled = true;
        
        // Tipos de notificación
        this.notificationTypes = {
            // Del cliente al dueño
            ORDER_CREATED: 'order_created',
            ORDER_PAID: 'order_paid',
            
            // Del dueño al cliente
            ORDER_RECEIVED: 'order_received',
            ORDER_CONFIRMED: 'order_confirmed',
            ORDER_READY: 'order_ready',
            ORDER_REJECTED: 'order_rejected'
        };
        
        console.log(`🔔 OrderNotificationSystem v${this.version} inicializado`);
        this.injectNotificationUI();
    }
    
    // ===== ENVIAR NOTIFICACIONES =====
    
    // Cliente → Dueño: Nuevo pedido creado
    notifyOrderCreated(orderData) {
        const notification = {
            id: this.generateNotificationId(),
            type: this.notificationTypes.ORDER_CREATED,
            from: 'cliente',
            to: 'dueño',
            orderId: orderData.id,
            customerName: orderData.nombreCliente,
            amount: orderData.total,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                items: orderData.items,
                horaRetiro: orderData.horaRetiro,
                metodoPago: orderData.metodoPago,
                telefono: orderData.telefonoCliente
            }
        };
        
        this.addNotification(notification);
        this.showToOwnerNotification('Nuevo pedido recibido', `${orderData.nombreCliente} - $${this.formatPrice(orderData.total)}`);
        this.playNotificationSound();
        
        return notification;
    }
    
    // Cliente → Dueño: Pedido pagado
    notifyOrderPaid(orderData, paymentResult) {
        const notification = {
            id: this.generateNotificationId(),
            type: this.notificationTypes.ORDER_PAID,
            from: 'cliente',
            to: 'dueño',
            orderId: orderData.id,
            customerName: orderData.nombreCliente,
            amount: orderData.total,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                transactionId: paymentResult.transactionId,
                paymentMethod: paymentResult.method,
                authCode: paymentResult.authorizationCode
            }
        };
        
        this.addNotification(notification);
        this.showToOwnerNotification('¡Pago confirmado!', `Pedido #${orderData.id} - ${orderData.nombreCliente}`);
        this.playNotificationSound();
        
        return notification;
    }
    
    // Dueño → Cliente: Pedido recibido
    notifyOrderReceived(orderId, customerData) {
        const notification = {
            id: this.generateNotificationId(),
            type: this.notificationTypes.ORDER_RECEIVED,
            from: 'dueño',
            to: 'cliente',
            orderId: orderId,
            customerName: customerData.nombre,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                message: 'Tu pedido ha sido recibido y está siendo preparado',
                estimatedTime: '30 minutos'
            }
        };
        
        this.addNotification(notification);
        this.showToCustomerNotification('Pedido recibido', 'Tu pedido está siendo preparado');
        this.playNotificationSound();
        
        return notification;
    }
    
    // Dueño → Cliente: Pedido confirmado  
    notifyOrderConfirmed(orderId, customerData, estimatedTime) {
        const notification = {
            id: this.generateNotificationId(),
            type: this.notificationTypes.ORDER_CONFIRMED,
            from: 'dueño',
            to: 'cliente',
            orderId: orderId,
            customerName: customerData.nombre,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                message: 'Tu pedido ha sido confirmado',
                estimatedTime: estimatedTime || '30 minutos'
            }
        };
        
        this.addNotification(notification);
        this.showToCustomerNotification('¡Pedido confirmado!', `Estará listo en ${estimatedTime || '30 minutos'}`);
        this.playNotificationSound();
        
        return notification;
    }
    
    // Dueño → Cliente: Pedido listo
    notifyOrderReady(orderId, customerData) {
        const notification = {
            id: this.generateNotificationId(),
            type: this.notificationTypes.ORDER_READY,
            from: 'dueño',
            to: 'cliente',
            orderId: orderId,
            customerName: customerData.nombre,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                message: '¡Tu pedido está listo para retirar!',
                pickupLocation: 'En la tienda'
            }
        };
        
        this.addNotification(notification);
        this.showToCustomerNotification('¡Pedido listo!', 'Ya puedes venir a retirarlo');
        this.playNotificationSound();
        
        return notification;
    }
    
    // ===== GESTIÓN DE NOTIFICACIONES =====
    addNotification(notification) {
        this.notifications.unshift(notification); // Agregar al inicio
        
        // Mantener solo las últimas 100 notificaciones
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }
        
        this.saveNotifications();
        this.updateNotificationBadges();
        this.notifySubscribers(notification);
    }
    
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadges();
        }
    }
    
    markAllAsRead(userType) {
        this.notifications.forEach(notification => {
            if (notification.to === userType) {
                notification.read = true;
            }
        });
        this.saveNotifications();
        this.updateNotificationBadges();
    }
    
    getNotificationsFor(userType, limit = 20) {
        return this.notifications
            .filter(n => n.to === userType)
            .slice(0, limit);
    }
    
    getUnreadCount(userType) {
        return this.notifications.filter(n => n.to === userType && !n.read).length;
    }
    
    // ===== UI DE NOTIFICACIONES =====
    injectNotificationUI() {
        // Crear contenedor de notificaciones flotantes
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
        
        // Crear centro de notificaciones
        this.createNotificationCenter();
        
        // Inyectar estilos
        this.injectNotificationStyles();
    }
    
    createNotificationCenter() {
        const modal = document.createElement('div');
        modal.id = 'notificationCenterModal';
        modal.className = 'notification-modal';
        
        modal.innerHTML = `
            <div class="notification-modal-content">
                <div class="notification-modal-header">
                    <h3>
                        <i class="fas fa-bell"></i>
                        Centro de Notificaciones
                    </h3>
                    <button class="notification-modal-close">&times;</button>
                </div>
                <div class="notification-modal-body">
                    <div class="notification-tabs">
                        <button class="notification-tab active" data-type="all">
                            Todas <span class="tab-count" id="allCount">0</span>
                        </button>
                        <button class="notification-tab" data-type="unread">
                            No leídas <span class="tab-count" id="unreadCount">0</span>
                        </button>
                    </div>
                    <div class="notification-list" id="notificationList">
                        <!-- Notificaciones se cargan aquí -->
                    </div>
                </div>
                <div class="notification-modal-footer">
                    <button class="btn-secondary" onclick="notificationSystem.markAllAsRead(getCurrentUserType())">
                        Marcar todas como leídas
                    </button>
                    <button class="btn-secondary" onclick="notificationSystem.closeNotificationCenter()">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupNotificationCenterEvents();
    }
    
    setupNotificationCenterEvents() {
        // Cerrar modal
        document.querySelector('.notification-modal-close')?.addEventListener('click', () => {
            this.closeNotificationCenter();
        });
        
        // Tabs
        document.querySelectorAll('.notification-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.loadNotifications(e.target.dataset.type);
            });
        });
        
        // Cerrar al hacer click fuera
        document.getElementById('notificationCenterModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'notificationCenterModal') {
                this.closeNotificationCenter();
            }
        });
    }
    
    showToOwnerNotification(title, message) {
        // Solo mostrar si el usuario actual es dueño/admin
        const currentInterface = document.getElementById('negocioInterface');
        if (currentInterface && currentInterface.classList.contains('active')) {
            this.showFloatingNotification(title, message, 'owner');
        }
    }
    
    showToCustomerNotification(title, message) {
        // Solo mostrar si el usuario actual es cliente
        const currentInterface = document.getElementById('clienteInterface');
        if (currentInterface && currentInterface.classList.contains('active')) {
            this.showFloatingNotification(title, message, 'customer');
        }
    }
    
    showFloatingNotification(title, message, type) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `floating-notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'owner' ? 'store' : 'shopping-cart'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
                <div class="notification-time">${new Date().toLocaleTimeString('es-CL')}</div>
            </div>
            <button class="notification-dismiss" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // ===== CENTRO DE NOTIFICACIONES =====
    openNotificationCenter() {
        const modal = document.getElementById('notificationCenterModal');
        if (modal) {
            modal.classList.add('active');
            this.loadNotifications('all');
        }
    }
    
    closeNotificationCenter() {
        const modal = document.getElementById('notificationCenterModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    loadNotifications(filter = 'all') {
        const list = document.getElementById('notificationList');
        if (!list) return;
        
        const userType = this.getCurrentUserType();
        let notifications = this.getNotificationsFor(userType);
        
        if (filter === 'unread') {
            notifications = notifications.filter(n => !n.read);
        }
        
        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No hay notificaciones</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        notifications.forEach(notification => {
            const item = this.createNotificationItem(notification);
            list.appendChild(item);
        });
        
        // Actualizar contadores
        this.updateNotificationCounts();
    }
    
    createNotificationItem(notification) {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        
        const icon = this.getNotificationIcon(notification.type);
        const time = this.formatNotificationTime(notification.timestamp);
        
        item.innerHTML = `
            <div class="notification-item-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-item-content">
                <div class="notification-item-title">
                    ${this.getNotificationTitle(notification)}
                </div>
                <div class="notification-item-message">
                    ${this.getNotificationMessage(notification)}
                </div>
                <div class="notification-item-time">${time}</div>
            </div>
            ${!notification.read ? '<div class="notification-unread-dot"></div>' : ''}
        `;
        
        // Marcar como leída al hacer click
        item.addEventListener('click', () => {
            this.markAsRead(notification.id);
            item.classList.remove('unread');
            item.classList.add('read');
            const dot = item.querySelector('.notification-unread-dot');
            if (dot) dot.remove();
        });
        
        return item;
    }
    
    // ===== UTILIDADES =====
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    
    getCurrentUserType() {
        // Detectar si está en interfaz de cliente o dueño
        const clienteInterface = document.getElementById('clienteInterface');
        const negocioInterface = document.getElementById('negocioInterface');
        
        if (negocioInterface && negocioInterface.classList.contains('active')) {
            return 'dueño';
        } else if (clienteInterface && clienteInterface.classList.contains('active')) {
            return 'cliente';
        }
        
        return 'cliente'; // Por defecto
    }
    
    getNotificationIcon(type) {
        const icons = {
            [this.notificationTypes.ORDER_CREATED]: 'plus-circle',
            [this.notificationTypes.ORDER_PAID]: 'credit-card',
            [this.notificationTypes.ORDER_RECEIVED]: 'check-circle',
            [this.notificationTypes.ORDER_CONFIRMED]: 'thumbs-up',
            [this.notificationTypes.ORDER_READY]: 'bell',
            [this.notificationTypes.ORDER_REJECTED]: 'times-circle'
        };
        return icons[type] || 'bell';
    }
    
    getNotificationTitle(notification) {
        const titles = {
            [this.notificationTypes.ORDER_CREATED]: 'Nuevo Pedido',
            [this.notificationTypes.ORDER_PAID]: 'Pago Confirmado',
            [this.notificationTypes.ORDER_RECEIVED]: 'Pedido Recibido',
            [this.notificationTypes.ORDER_CONFIRMED]: 'Pedido Confirmado',
            [this.notificationTypes.ORDER_READY]: 'Pedido Listo',
            [this.notificationTypes.ORDER_REJECTED]: 'Pedido Rechazado'
        };
        return titles[notification.type] || 'Notificación';
    }
    
    getNotificationMessage(notification) {
        switch (notification.type) {
            case this.notificationTypes.ORDER_CREATED:
                return `${notification.customerName} - $${this.formatPrice(notification.amount)}`;
            case this.notificationTypes.ORDER_PAID:
                return `Pedido #${notification.orderId} - ${notification.customerName}`;
            case this.notificationTypes.ORDER_RECEIVED:
                return notification.data.message;
            case this.notificationTypes.ORDER_CONFIRMED:
                return `Estará listo en ${notification.data.estimatedTime}`;
            case this.notificationTypes.ORDER_READY:
                return notification.data.message;
            default:
                return 'Nueva notificación';
        }
    }
    
    formatNotificationTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Menos de 1 minuto
            return 'Ahora';
        } else if (diff < 3600000) { // Menos de 1 hora
            return `${Math.floor(diff / 60000)}m`;
        } else if (diff < 86400000) { // Menos de 1 día
            return `${Math.floor(diff / 3600000)}h`;
        } else {
            return date.toLocaleDateString('es-CL');
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    }
    
    // ===== SONIDOS =====
    playNotificationSound() {
        if (!this.soundEnabled) return;
        
        // Crear audio sintético (beep)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('🔇 Audio no disponible');
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
    
    // ===== PERSISTENCIA =====
    saveNotifications() {
        localStorage.setItem('negocioVecino_notifications', JSON.stringify(this.notifications));
    }
    
    // ===== BADGES Y CONTADORES =====
    updateNotificationBadges() {
        const userType = this.getCurrentUserType();
        const unreadCount = this.getUnreadCount(userType);
        
        // Actualizar badge en el header (si existe)
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
        // Actualizar título de la página
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Negocio Vecino`;
        } else {
            document.title = 'Negocio Vecino';
        }
    }
    
    updateNotificationCounts() {
        const userType = this.getCurrentUserType();
        const allCount = this.getNotificationsFor(userType).length;
        const unreadCount = this.getUnreadCount(userType);
        
        const allCountElement = document.getElementById('allCount');
        const unreadCountElement = document.getElementById('unreadCount');
        
        if (allCountElement) allCountElement.textContent = allCount;
        if (unreadCountElement) unreadCountElement.textContent = unreadCount;
    }
    
    // ===== SUSCRIPTORES (EVENTOS) =====
    subscribe(eventType, callback) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push(callback);
    }
    
    notifySubscribers(notification) {
        const callbacks = this.subscribers[notification.type] || [];
        callbacks.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('Error en callback de notificación:', error);
            }
        });
    }
    
    // ===== ESTILOS =====
    injectNotificationStyles() {
        if (document.getElementById('notificationStyles')) return;
        
        const styles = `
            <style id="notificationStyles">
                /* CONTENEDOR DE NOTIFICACIONES FLOTANTES */
                .notification-container {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                    max-width: 350px;
                }
                
                .floating-notification {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    border-left: 4px solid #e67e22;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    pointer-events: auto;
                    animation: slideInRight 0.3s ease;
                    position: relative;
                }
                
                .floating-notification.owner {
                    border-left-color: #2c3e50;
                }
                
                .floating-notification.customer {
                    border-left-color: #e67e22;
                }
                
                .notification-icon {
                    width: 40px;
                    height: 40px;
                    background: #e67e22;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }
                
                .floating-notification.owner .notification-icon {
                    background: #2c3e50;
                }
                
                .notification-content {
                    flex: 1;
                }
                
                .notification-title {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 4px;
                }
                
                .notification-message {
                    color: #7f8c8d;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                
                .notification-time {
                    color: #95a5a6;
                    font-size: 12px;
                }
                
                .notification-dismiss {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: #95a5a6;
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .notification-dismiss:hover {
                    background: #ecf0f1;
                    color: #e74c3c;
                }
                
                /* MODAL CENTRO DE NOTIFICACIONES */
                .notification-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }
                
                .notification-modal.active {
                    display: flex;
                }
                
                .notification-modal-content {
                    background: white;
                    border-radius: 16px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                
                .notification-modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #ecf0f1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .notification-modal-header h3 {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #2c3e50;
                }
                
                .notification-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #95a5a6;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-modal-close:hover {
                    background: #ecf0f1;
                    color: #e74c3c;
                }
                
                .notification-modal-body {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .notification-tabs {
                    display: flex;
                    border-bottom: 1px solid #ecf0f1;
                }
                
                .notification-tab {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-weight: 500;
                    color: #7f8c8d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .notification-tab.active {
                    color: #e67e22;
                    border-bottom: 2px solid #e67e22;
                }
                
                .tab-count {
                    background: #ecf0f1;
                    color: #7f8c8d;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
                
                .notification-tab.active .tab-count {
                    background: #e67e22;
                    color: white;
                }
                
                .notification-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }
                
                .notification-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    margin-bottom: 8px;
                }
                
                .notification-item:hover {
                    background: #f8f9fa;
                }
                
                .notification-item.unread {
                    background: rgba(230, 126, 34, 0.05);
                }
                
                .notification-item-icon {
                    width: 40px;
                    height: 40px;
                    background: #e67e22;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .notification-item-content {
                    flex: 1;
                }
                
                .notification-item-title {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 4px;
                }
                
                .notification-item-message {
                    color: #7f8c8d;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                
                .notification-item-time {
                    color: #95a5a6;
                    font-size: 12px;
                }
                
                .notification-unread-dot {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 8px;
                    height: 8px;
                    background: #e74c3c;
                    border-radius: 50%;
                }
                
                .no-notifications {
                    text-align: center;
                    padding: 40px;
                    color: #95a5a6;
                }
                
                .no-notifications i {
                    font-size: 3rem;
                    margin-bottom: 16px;
                    display: block;
                }
                
                .notification-modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #ecf0f1;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                
                /* ANIMACIONES */
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                /* RESPONSIVE */
                @media (max-width: 768px) {
                    .notification-container {
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                    
                    .floating-notification {
                        padding: 12px;
                    }
                    
                    .notification-modal-content {
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

// ===== INICIALIZACIÓN GLOBAL =====
if (typeof window !== 'undefined') {
    window.notificationSystem = new OrderNotificationSystem();
    console.log('🔔 OrderNotificationSystem disponible globalmente');
}

// ===== FUNCIONES HELPER =====
function notifyOrderCreated(orderData) {
    if (window.notificationSystem) {
        return window.notificationSystem.notifyOrderCreated(orderData);
    }
}

function notifyOrderPaid(orderData, paymentResult) {
    if (window.notificationSystem) {
        return window.notificationSystem.notifyOrderPaid(orderData, paymentResult);
    }
}

function notifyOrderReceived(orderId, customerData) {
    if (window.notificationSystem) {
        return window.notificationSystem.notifyOrderReceived(orderId, customerData);
    }
}

function openNotificationCenter() {
    if (window.notificationSystem) {
        window.notificationSystem.openNotificationCenter();
    }
}

console.log('🔔 Notification System cargado - Funciones: notifyOrderCreated(), notifyOrderPaid(), etc.');