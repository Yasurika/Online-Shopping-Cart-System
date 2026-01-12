const user = checkAuth();
let order = null;

if (user) {
    document.getElementById('userName').textContent = user.fullName || user.username;
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        showError('No order ID provided');
    }
}

async function loadOrderDetails(orderId) {
    try {
        console.log('[ORDER-DETAILS] Loading order:', orderId);
        
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load order: ${response.status}`);
        }
        
        order = await response.json();
        console.log('[ORDER-DETAILS] Order loaded:', order);
        displayOrderDetails(order);
    } catch (error) {
        console.error('[ORDER-DETAILS] Error loading order:', error);
        showError('Error loading order details: ' + error.message);
    }
}

function displayOrderDetails(order) {
    const container = document.getElementById('detailsContent');
    document.getElementById('orderTitle').textContent = `Order #${order.id}`;
    
    const createdDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let total = 0;
    const itemsHTML = order.items.map(item => {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        
        return `
            <div class="detail-item">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" class="detail-item-img">
                <div class="detail-item-info">
                    <h4>${item.product.name}</h4>
                    <p class="item-description">${item.product.description || 'No description'}</p>
                    <div class="item-meta">
                        <span class="item-qty">Quantity: ${item.quantity}</span>
                        <span class="item-price">Unit Price: $${item.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="detail-item-subtotal">
                    <p class="subtotal-label">Subtotal</p>
                    <p class="subtotal-value">$${subtotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="details-grid">
            <!-- Order Information -->
            <div class="details-card">
                <h3>📋 Order Information</h3>
                <div class="info-field">
                    <label>Order ID</label>
                    <p>#${order.id}</p>
                </div>
                <div class="info-field">
                    <label>Order Date</label>
                    <p>${createdDate}</p>
                </div>
                <div class="info-field">
                    <label>Order Status</label>
                    <p><span class="status-badge ${order.status.toLowerCase()}">${formatStatus(order.status)}</span></p>
                </div>
            </div>
            
            <!-- Shipping Information -->
            <div class="details-card">
                <h3>🚚 Shipping Information</h3>
                <div class="info-field">
                    <label>Shipping Address</label>
                    <p>${order.shippingAddress || 'Not provided'}</p>
                </div>
                <div class="info-field">
                    <label>Tracking Number</label>
                    <p>${order.trackingNumber || 'Not available yet'}</p>
                </div>
            </div>
            
            <!-- Payment Information -->
            <div class="details-card">
                <h3>💳 Payment Information</h3>
                <div class="info-field">
                    <label>Payment Method</label>
                    <p>${order.paymentMethod || 'N/A'}</p>
                </div>
                <div class="info-field">
                    <label>Payment Status</label>
                    <p><span class="payment-badge">Completed</span></p>
                </div>
            </div>
            
            <!-- Order Items -->
            <div class="details-card full-width">
                <h3>📦 Order Items</h3>
                <div class="items-list">
                    ${itemsHTML}
                </div>
            </div>
            
            <!-- Order Summary -->
            <div class="details-card full-width">
                <h3>💰 Order Summary</h3>
                <div class="summary-section">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax:</span>
                        <span>$0.00</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total Amount:</span>
                        <span>$${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="details-actions">
            <button class="btn btn-primary" onclick="window.location.href='order-history.html'">Back to Order History</button>
            <button class="btn btn-secondary" onclick="downloadInvoice(${order.id})">Download Invoice</button>
        </div>
    `;
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

function showError(message) {
    const container = document.getElementById('detailsContent');
    container.innerHTML = `
        <div class="error-state">
            <h2>Error</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="window.location.href='order-history.html'">
                Back to Order History
            </button>
        </div>
    `;
}

function downloadInvoice(orderId) {
    alert('Invoice download feature coming soon!');
    // In a real application, this would generate and download a PDF invoice
}
