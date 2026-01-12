const user = checkAuth();
let currentTab = 'cart';
let cart = null;
let orders = null;

if (user) {
    document.getElementById('userName').textContent = user.fullName || user.username;
    loadCart();
    loadOrders();
    loadProfile();
    
    // Check if user was redirected from checkout with tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'orders') {
        switchTab('orders', { target: document.querySelector('[onclick*="orders"]') });
    }
}

function switchTab(tab, event) {
    event.preventDefault();
    currentTab = tab;
    
    // Hide all sections
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${tab}-section`).classList.add('active');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ============ CART MANAGEMENT ============
async function loadCart() {
    try {
        console.log('[DASHBOARD] Loading cart...');
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load cart: ${response.status}`);
        }
        
        cart = await response.json();
        console.log('[DASHBOARD] Cart loaded:', cart);
        displayCartForManagement(cart);
    } catch (error) {
        console.error('[DASHBOARD] Error loading cart:', error);
        document.getElementById('cartManagement').innerHTML = `
            <div class="error-message">Error loading cart: ${error.message}</div>
        `;
    }
}

function displayCartForManagement(cartData) {
    const container = document.getElementById('cartManagement');
    
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke-width="2"/>
                </svg>
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items</p>
                <button class="btn btn-primary" onclick="window.location.href='products.html'">
                    Continue Shopping
                </button>
            </div>
        `;
        return;
    }
    
    let total = 0;
    const itemsHTML = cartData.items.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item-management">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" class="item-img">
                <div class="item-details">
                    <h4>${item.product.name}</h4>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                    <div class="item-controls">
                        <button class="qty-btn" onclick="decreaseQty(${item.product.id})">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="increaseQty(${item.product.id})">+</button>
                    </div>
                </div>
                <div class="item-subtotal">$${subtotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeCartItem(${item.id})">×</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="cart-items-list">${itemsHTML}</div>
        <div class="cart-summary-management">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span class="total-amount">$${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary full-width" onclick="proceedToCheckout()">
                Proceed to Checkout
            </button>
            <button class="btn btn-secondary full-width" onclick="window.location.href='products.html'">
                Continue Shopping
            </button>
        </div>
    `;
}

async function removeCartItem(itemId) {
    if (!confirm('Remove this item from cart?')) return;
    
    try {
        console.log('[DASHBOARD] Removing item:', itemId);
        
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}/item/${itemId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await response.json();
        console.log('[DASHBOARD] Remove response:', data);
        
        if (response.ok && data.success) {
            alert('Item removed from cart');
            await loadCart();
        } else {
            alert('Failed to remove item: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('[DASHBOARD] Error removing item:', error);
        alert('Error removing item');
    }
}

async function decreaseQty(productId) {
    if (!cart) return;
    const item = cart.items.find(i => i.product.id === productId);
    if (item) {
        const newQty = item.quantity - 1;
        if (newQty < 1) {
            removeCartItem(item.id);
        } else {
            updateQty(productId, newQty);
        }
    }
}

async function increaseQty(productId) {
    if (!cart) return;
    const item = cart.items.find(i => i.product.id === productId);
    if (item) {
        updateQty(productId, item.quantity + 1);
    }
}

async function updateQty(productId, quantity) {
    try {
        console.log('[DASHBOARD] Updating quantity:', productId, quantity);
        
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}/update`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({productId: parseInt(productId, 10), quantity: quantity})
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('[DASHBOARD] Quantity updated');
            await loadCart();
        } else {
            alert('Failed to update quantity');
            await loadCart();
        }
    } catch (error) {
        console.error('[DASHBOARD] Error updating quantity:', error);
    }
}

// ============ ORDER HISTORY ============
async function loadOrders() {
    try {
        console.log('[DASHBOARD] Loading orders...');
        const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load orders: ${response.status}`);
        }
        
        orders = await response.json();
        console.log('[DASHBOARD] Orders loaded:', orders);
        displayOrdersList(orders);
    } catch (error) {
        console.error('[DASHBOARD] Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = `
            <div class="error-message">Error loading orders</div>
        `;
    }
}

function displayOrdersList(ordersData) {
    const container = document.getElementById('ordersList');
    
    if (!ordersData || ordersData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No orders yet</p>
                <button class="btn btn-primary" onclick="switchTab('cart', {target: document.querySelector('[onclick*=\"cart\"]')}); window.location.hash='#cart'">
                    Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ordersData.map(order => `
        <div class="order-card-compact">
            <div class="order-header-compact">
                <div>
                    <h4>Order #${order.id}</h4>
                    <p class="order-date">${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="status-badge ${order.status.toLowerCase()}">
                    ${order.status}
                </div>
            </div>
            
            <div class="order-items-compact">
                ${order.items.map(item => `
                    <div class="order-item-mini">
                        <img src="${item.product.imageUrl}" alt="${item.product.name}">
                        <div>
                            <p>${item.product.name}</p>
                            <p class="small">Qty: ${item.quantity}</p>
                        </div>
                        <span>$${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer-compact">
                <span class="order-total">Total: <strong>$${order.totalAmount.toFixed(2)}</strong></span>
                <button class="btn-small" onclick="viewOrderDetails(${order.id})">View Details</button>
            </div>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
}

// ============ PROFILE ============
async function loadProfile() {
    try {
        console.log('[DASHBOARD] Loading profile...');
        const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load profile: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('[DASHBOARD] Profile loaded:', userData);
        displayProfile(userData);
    } catch (error) {
        console.error('[DASHBOARD] Error loading profile:', error);
        document.getElementById('profileInfo').innerHTML = `
            <div class="error-message">Error loading profile</div>
        `;
    }
}

function displayProfile(userData) {
    const container = document.getElementById('profileInfo');
    
    const createdDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A';
    const createdTime = userData.createdAt ? new Date(userData.createdAt).toLocaleTimeString() : 'N/A';
    
    console.log('[DASHBOARD] Displaying profile for:', userData.username);
    console.log('[DASHBOARD] Orders count:', orders ? orders.length : 0);
    console.log('[DASHBOARD] Cart items count:', cart && cart.items ? cart.items.length : 0);
    
    const ordersCount = orders ? orders.length : 0;
    const cartItemsCount = cart && cart.items ? cart.items.length : 0;
    
    container.innerHTML = `
        <div class="profile-details">
            <div class="profile-card">
                <h3>👤 Account Information</h3>
                <div class="profile-field">
                    <label>Username</label>
                    <p>${userData.username || 'N/A'}</p>
                </div>
                <div class="profile-field">
                    <label>Email Address</label>
                    <p>${userData.email || 'N/A'}</p>
                </div>
                <div class="profile-field">
                    <label>Full Name</label>
                    <p>${userData.fullName || 'Not set'}</p>
                </div>
                <div class="profile-field">
                    <label>Account Role</label>
                    <p>${userData.role || 'User'}</p>
                </div>
                <div class="profile-field">
                    <label>Account Status</label>
                    <p><span class="status-active">Active</span></p>
                </div>
            </div>
            
            <div class="profile-card">
                <h3>📊 Quick Stats</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders</span>
                        <span class="stat-value">${ordersCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Cart Items</span>
                        <span class="stat-value">${cartItemsCount}</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-card">
                <h3>⭐ Customer Feedback</h3>
                <div class="feedback-section">
                    <p class="feedback-prompt">How would you rate your shopping experience?</p>
                    <div class="rating-container">
                        <button class="rating-btn" onclick="submitReview('good')" title="Good">👍</button>
                        <button class="rating-btn" onclick="submitReview('neutral')" title="Neutral">😐</button>
                        <button class="rating-btn" onclick="submitReview('bad')" title="Bad">👎</button>
                    </div>
                    <p class="feedback-status" id="feedbackStatus"></p>
                </div>
            </div>
            
            <div class="profile-card">
                <h3>📅 Membership Details</h3>
                <div class="profile-field">
                    <label>Member Since</label>
                    <p>${createdDate}</p>
                </div>
                <div class="profile-field">
                    <label>Join Time</label>
                    <p>${createdTime}</p>
                </div>
                <div class="profile-field">
                    <label>User ID</label>
                    <p>#${userData.id || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;
}

function proceedToCheckout() {
    console.log('[DASHBOARD] Proceeding to checkout...');
    console.log('[DASHBOARD] Current cart:', cart);
    
    // Validate cart has items
    if (!cart || !cart.items || cart.items.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }
    
    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('[DASHBOARD] Cart items:', cart.items.length);
    console.log('[DASHBOARD] Cart total:', total.toFixed(2));
    
    // Store cart and total in session storage for checkout page
    sessionStorage.setItem('checkoutCart', JSON.stringify(cart.items));
    sessionStorage.setItem('checkoutTotal', total.toFixed(2));
    
    console.log('[DASHBOARD] Cart saved to sessionStorage');
    
    // Navigate to checkout
    window.location.href = 'checkout.html';
}

// ============ CUSTOMER REVIEWS ============
async function submitReview(rating) {
    try {
        console.log('[DASHBOARD] Submitting review:', rating);
        
        const response = await fetch(`${API_BASE_URL}/api/reviews`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: user.id,
                rating: rating,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const statusEl = document.getElementById('feedbackStatus');
            const messages = {
                'good': '✓ Thank you for the positive feedback!',
                'neutral': '✓ Thank you for your feedback!',
                'bad': '✓ We appreciate your feedback. We will work on improvements.'
            };
            statusEl.textContent = messages[rating];
            statusEl.style.color = 'green';
        } else {
            document.getElementById('feedbackStatus').textContent = 'Error submitting feedback';
        }
    } catch (error) {
        console.error('[DASHBOARD] Error submitting review:', error);
        document.getElementById('feedbackStatus').textContent = 'Error submitting feedback';
    }
}

// Refresh data every minute
setInterval(() => {
    if (currentTab === 'cart') loadCart();
    if (currentTab === 'orders') loadOrders();
}, 60000);
