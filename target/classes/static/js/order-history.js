const user = checkAuth();
let allOrders = [];

if (user) {
    document.getElementById('userName').textContent = user.fullName || user.username;
    loadOrderHistory();
}

async function loadOrderHistory() {
    try {
        console.log('[ORDER-HISTORY] Loading orders for user:', user.id);
        
        const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load orders: ${response.status}`);
        }
        
        allOrders = await response.json();
        console.log('[ORDER-HISTORY] Orders loaded:', allOrders);
        displayOrders(allOrders);
    } catch (error) {
        console.error('[ORDER-HISTORY] Error loading orders:', error);
        document.getElementById('ordersContainer').innerHTML = `
            <div class="error-message">
                <p>Error loading orders: ${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="empty-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" stroke-width="2"/>
                </svg>
                <h2>No orders yet</h2>
                <p>Start shopping to create your first order</p>
                <button class="btn btn-primary" onclick="window.location.href='products.html'">
                    Shop Now
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card" data-status="${order.status}">
            <div class="order-card-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${formatDate(order.createdAt)}</p>
                </div>
                <div class="order-status-badge ${order.status.toLowerCase()}">
                    ${formatStatus(order.status)}
                </div>
            </div>
            
            <div class="order-items-section">
                <h4>Items</h4>
                <div class="items-grid-small">
                    ${order.items.map(item => `
                        <div class="order-item-card-small">
                            <img src="${item.product.imageUrl}" alt="${item.product.name}" class="item-thumbnail-small">
                            <div class="item-info-small">
                                <p class="item-name-small">${item.product.name}</p>
                                <p class="item-qty-small">Qty: ${item.quantity}</p>
                                <p class="item-price-small">$${item.price.toFixed(2)}</p>
                            </div>
                            <span class="item-subtotal-small">$${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="order-card-footer">
                <div class="order-summary">
                    <div class="summary-line">
                        <span>Payment Method:</span>
                        <span>${order.paymentMethod || 'N/A'}</span>
                    </div>
                    <div class="summary-line">
                        <span>Shipping Address:</span>
                        <span>${order.shippingAddress || 'N/A'}</span>
                    </div>
                    <div class="summary-line total">
                        <span>Total Amount:</span>
                        <span>$${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn-view" onclick="viewOrderDetails(${order.id})">View Details</button>
                    ${order.status === 'PENDING' ? `
                        <button class="btn-cancel" onclick="cancelOrder(${order.id})">Cancel Order</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatStatus(status) {
    const statusMap = {
        'PENDING': '⏳ Pending',
        'PROCESSING': '⚙️ Processing',
        'SHIPPED': '🚚 Shipped',
        'DELIVERED': '✅ Delivered',
        'CANCELLED': '❌ Cancelled'
    };
    return statusMap[status] || status;
}

function filterByStatus() {
    const selectedStatus = document.getElementById('statusFilter').value;
    
    if (!selectedStatus) {
        displayOrders(allOrders);
        return;
    }
    
    const filtered = allOrders.filter(order => order.status === selectedStatus);
    displayOrders(filtered);
}

function viewOrderDetails(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: 'CANCELLED'})
        });
        
        if (response.ok) {
            alert('Order cancelled successfully');
            loadOrderHistory();
        } else {
            alert('Failed to cancel order');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Error cancelling order');
    }
}

// Auto-refresh every 2 minutes
setInterval(() => {
    loadOrderHistory();
}, 120000);
