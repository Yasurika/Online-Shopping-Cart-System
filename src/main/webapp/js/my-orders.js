// My Orders Management Module
const MyOrders = (() => {
    const config = {
        storageKey: 'userOrders',
        ordersPerPage: 10
    };

    let currentPage = 1;
    let allOrders = [];

    // Initialize orders module
    const init = () => {
        loadOrders();
        setupEventListeners();
    };

    // Load orders from localStorage
    const loadOrders = () => {
        allOrders = JSON.parse(localStorage.getItem(config.storageKey)) || [];
        displayOrders();
    };

    // Setup event listeners
    const setupEventListeners = () => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterOrders(e.target.getAttribute('data-status'));
            });
        });
    };

    // Display orders
    const displayOrders = (ordersToDisplay = allOrders) => {
        const ordersDiv = document.getElementById('ordersDiv');

        if (ordersToDisplay.length === 0) {
            ordersDiv.innerHTML = '<div class="no-orders"><p>No orders found</p></div>';
            return;
        }

        let html = '';
        ordersToDisplay.forEach((order, index) => {
            const statusClass = `status-${order.status.toLowerCase()}`;
            const totalPrice = calculateOrderTotal(order.items);

            html += `
                <div class="order-item" data-order-id="${order.id}">
                    <div class="order-header">
                        <div>
                            <span class="order-id">Order #${order.id}</span>
                            <span class="order-date">${formatDate(order.date)}</span>
                        </div>
                        <span class="order-status ${statusClass}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
                        <p><strong>Items:</strong> ${order.items.length}</p>
                        <p><strong>Delivery Date:</strong> ${order.deliveryDate || 'Pending'}</p>
                    </div>
                    <div class="order-items">
                        <strong>Items:</strong>
                        ${order.items.slice(0, 3).map(item => `
                            <div class="item-row">
                                <span>${item.name} x${item.quantity}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `<div class="item-row"><em>+${order.items.length - 3} more items</em></div>` : ''}
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-primary" onclick="MyOrders.viewOrderDetails('${order.id}')">View Details</button>
                        <button class="btn btn-secondary" onclick="MyOrders.downloadInvoice('${order.id}')">Invoice</button>
                        <button class="btn btn-secondary" onclick="MyOrders.trackOrder('${order.id}')">Track</button>
                    </div>
                </div>
            `;
        });

        ordersDiv.innerHTML = html;
    };

    // Filter orders by status
    const filterOrders = (status) => {
        if (status === 'all') {
            displayOrders(allOrders);
        } else {
            const filtered = allOrders.filter(order => 
                order.status.toLowerCase() === status.toLowerCase()
            );
            displayOrders(filtered);
        }
    };

    // View order details
    const viewOrderDetails = (orderId) => {
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="order-item-detail">
                        <span>${item.name}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });

            const totalPrice = calculateOrderTotal(order.items);
            const detailsHtml = `
                <div class="order-details-modal">
                    <h3>Order #${order.id}</h3>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Order Date:</strong> ${formatDate(order.date)}</p>
                    <p><strong>Delivery Address:</strong> ${order.address || 'Not provided'}</p>
                    <h4>Items Ordered:</h4>
                    ${itemsHtml}
                    <h4>Order Summary:</h4>
                    <p><strong>Subtotal:</strong> $${totalPrice.toFixed(2)}</p>
                    <p><strong>Tax:</strong> $${(totalPrice * 0.1).toFixed(2)}</p>
                    <p><strong>Shipping:</strong> $${order.shipping || '5.00'}</p>
                    <p><strong>Total:</strong> $${(totalPrice + (totalPrice * 0.1) + parseFloat(order.shipping || 5)).toFixed(2)}</p>
                </div>
            `;
            
            alert(detailsHtml);
        }
    };

    // Download invoice
    const downloadInvoice = (orderId) => {
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            const invoiceData = generateInvoiceData(order);
            downloadFile(invoiceData, `invoice-${orderId}.txt`);
            alert('Invoice downloading...');
        }
    };

    // Track order
    const trackOrder = (orderId) => {
        alert('Tracking page will open for order: ' + orderId);
    };

    // Generate invoice data
    const generateInvoiceData = (order) => {
        const totalPrice = calculateOrderTotal(order.items);
        const tax = totalPrice * 0.1;
        const shipping = parseFloat(order.shipping || 5);
        const total = totalPrice + tax + shipping;

        let invoiceText = `
===============================================
                    INVOICE
===============================================
Order ID: ${order.id}
Date: ${formatDate(order.date)}
Status: ${order.status}

ITEMS ORDERED:
${order.items.map(item => `
${item.name}
  Quantity: ${item.quantity}
  Unit Price: $${item.price}
  Total: $${(item.price * item.quantity).toFixed(2)}
`).join('')}

SUMMARY:
Subtotal:           $${totalPrice.toFixed(2)}
Tax (10%):          $${tax.toFixed(2)}
Shipping:           $${shipping.toFixed(2)}
---
TOTAL:              $${total.toFixed(2)}

Delivery Address:
${order.address || 'Not provided'}

===============================================
        Thank you for your purchase!
===============================================
        `;

        return invoiceText;
    };

    // Calculate order total
    const calculateOrderTotal = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Download file
    const downloadFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Add new order (for testing)
    const addOrder = (orderData) => {
        const newOrder = {
            id: generateOrderId(),
            date: new Date().toISOString(),
            status: 'Pending',
            items: orderData.items || [],
            address: orderData.address || '',
            shipping: orderData.shipping || '5.00'
        };

        allOrders.unshift(newOrder);
        localStorage.setItem(config.storageKey, JSON.stringify(allOrders));
        displayOrders();
        return newOrder;
    };

    // Generate order ID
    const generateOrderId = () => {
        return 'ORD' + Date.now();
    };

    // Get all orders
    const getAllOrders = () => {
        return allOrders;
    };

    // Get order by ID
    const getOrderById = (orderId) => {
        return allOrders.find(o => o.id === orderId);
    };

    // Update order status
    const updateOrderStatus = (orderId, newStatus) => {
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            localStorage.setItem(config.storageKey, JSON.stringify(allOrders));
            displayOrders();
        }
    };

    // Public API
    return {
        init,
        loadOrders,
        displayOrders,
        filterOrders,
        viewOrderDetails,
        downloadInvoice,
        trackOrder,
        addOrder,
        getAllOrders,
        getOrderById,
        updateOrderStatus
    };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    MyOrders.init();
});
