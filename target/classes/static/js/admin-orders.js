// Check admin authentication
const admin = checkAdmin();
let allOrders = [];
let filteredOrders = [];

if (admin) {
    document.getElementById('adminName').textContent = admin.fullName || admin.username;
    loadOrders();
    setupSearchListener();
}

function checkAdmin() {
    const admin = localStorage.getItem('admin');
    if (!admin) {
        window.location.href = 'admin-login.html';
        return null;
    }
    try {
        const adminData = JSON.parse(admin);
        // Check for admin role or username
        if (adminData.role === 'ADMIN' || adminData.username === 'admin') {
            return adminData;
        }
        alert('Access denied. Admin privileges required.');
        window.location.href = 'admin-login.html';
        return null;
    } catch (e) {
        console.error('Invalid admin data:', e);
        window.location.href = 'admin-login.html';
        return null;
    }
}

async function loadOrders() {
    try {
        console.log('Loading all orders...');

        // Get all users first
        const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
        let users = [];

        if (usersResponse.ok) {
            users = await usersResponse.json();
        }

        // Get orders for all users
        allOrders = [];
        for (const user of users) {
            try {
                const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
                if (ordersResponse.ok) {
                    const userOrders = await ordersResponse.json();
                    allOrders = allOrders.concat(userOrders);
                }
            } catch (error) {
                console.log(`No orders for user ${user.id}`);
            }
        }

        console.log('Total orders loaded:', allOrders.length);
        filteredOrders = allOrders;

        updateOrderStats();
        displayOrders(filteredOrders);

    } catch (error) {
        console.error('Error loading orders:', error);
        // Display empty state
        displayOrders([]);
    }
}

function updateOrderStats() {
    const pending = allOrders.filter(o => o.status === 'PENDING').length;
    const processing = allOrders.filter(o => o.status === 'PROCESSING').length;
    const completed = allOrders.filter(o => o.status === 'DELIVERED').length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('processingOrders').textContent = processing;
    document.getElementById('completedOrders').textContent = completed;
    document.getElementById('totalOrderRevenue').textContent = '$' + totalRevenue.toFixed(2);
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-orders">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-width="2"/>
                        </svg>
                        <h3>No Orders Found</h3>
                        <p>There are no orders to display</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    orders.forEach(order => {
        const row = document.createElement('tr');

        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        row.innerHTML = `
            <td><span class="order-id">#${order.id}</span></td>
            <td>
                <div class="customer-info">
                    <span class="customer-name">${order.user.fullName || order.user.username}</span>
                    <span class="customer-email">${order.user.email}</span>
                </div>
            </td>
            <td><span class="order-date">${formattedDate}</span></td>
            <td><span class="items-count">${order.items?.length || 0} items</span></td>
            <td><span class="order-total">$${parseFloat(order.totalAmount).toFixed(2)}</span></td>
            <td><span class="payment-method">${order.paymentMethod || 'N/A'}</span></td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <button class="btn-view-order" onclick="viewOrderDetails(${order.id})">
                    View Details
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function setupSearchListener() {
    const searchInput = document.getElementById('searchOrders');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterOrders();
        }, 300);
    });
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    filteredOrders = allOrders.filter(order => {
        // Search filter - supports Order ID, Customer ID, Username, Email, and Full Name
        let matchesSearch = true;
        if (searchTerm) {
            matchesSearch =
                order.id.toString().includes(searchTerm) ||                          // Order ID
                order.user.id.toString().includes(searchTerm) ||                    // Customer ID
                order.user.username.toLowerCase().includes(searchTerm) ||           // Username
                order.user.email.toLowerCase().includes(searchTerm) ||              // Email
                (order.user.fullName && order.user.fullName.toLowerCase().includes(searchTerm));  // Full Name
        }

        // Status filter
        const matchesStatus = !statusFilter || order.status === statusFilter;

        // Date filter
        let matchesDate = true;
        if (dateFilter) {
            const orderDate = new Date(order.createdAt);
            const now = new Date();

            if (dateFilter === 'today') {
                matchesDate = orderDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = orderDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = orderDate >= monthAgo;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    displayOrders(filteredOrders);
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        const order = await response.json();

        const detailsContainer = document.getElementById('orderDetails');

        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        detailsContainer.innerHTML = `
            <div class="detail-section">
                <h3>Order Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Order ID</span>
                        <span class="detail-value">#${order.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Order Date</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value"><span class="status-badge ${order.status}">${order.status}</span></span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">${order.paymentMethod || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Customer Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Name</span>
                        <span class="detail-value">${order.user.fullName || order.user.username}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <span class="detail-value">${order.user.email}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${order.user.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Shipping Address</span>
                        <span class="detail-value">${order.shippingAddress || order.user.address || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Order Items</h3>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-info">
                                <span class="item-name">${item.product.name}</span>
                                <span class="item-quantity">Quantity: ${item.quantity} × $${parseFloat(item.price).toFixed(2)}</span>
                            </div>
                            <span class="item-price">$${(item.quantity * parseFloat(item.price)).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <div class="status-change">
                    <label>Update Order Status:</label>
                    <select id="newStatus">
                        <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="PROCESSING" ${order.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
                        <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                        <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                        <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="btn-update-status" onclick="updateOrderStatus(${order.id})">
                        Update Status
                    </button>
                </div>
            </div>
        `;

        document.getElementById('orderModal').classList.add('show');

    } catch (error) {
        console.error('Error loading order details:', error);
        alert('Failed to load order details');
    }
}

async function updateOrderStatus(orderId) {
    const newStatus = document.getElementById('newStatus').value;

    try {
        // Note: You'll need to create this endpoint in the backend
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Order status updated successfully!');
            closeOrderModal();
            loadOrders();
        } else {
            alert('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('This feature will be available once you add the update status endpoint to the backend');
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('show');
}

function clearFilters() {
    document.getElementById('searchOrders').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    filteredOrders = allOrders;
    displayOrders(filteredOrders);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeOrderModal();
    }
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin');
        window.location.href = 'admin-login.html';
    }
}