const user = checkAuth();
let cart = null;

if (user) {
    document.getElementById('userName').textContent = user.fullName || user.username;
    loadCart();
}

async function loadCart() {
    try {
        console.log('[CART] Loading cart for user:', user.id);
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load cart: ${response.status}`);
        }
        
        cart = await response.json();
        console.log('[CART] Loaded cart:', cart);
        console.log('[CART] Number of items:', cart.items ? cart.items.length : 0);
        
        displayCart();
    } catch (error) {
        console.error('[CART] Error loading cart:', error);
        alert('Failed to load cart: ' + error.message);
    }
}

function displayCart() {
    const container = document.getElementById('cartItems');
    
    console.log('[DISPLAY] Rendering cart...');
    console.log('[DISPLAY] Cart object:', cart);
    
    if (!cart || !cart.items || cart.items.length === 0) {
        console.log('[DISPLAY] Cart is empty');
        container.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke-width="2"/>
                </svg>
                <h2>Your cart is empty</h2>
                <p>Add some products to get started</p>
                <button class="btn btn-primary" onclick="window.location.href='products.html'">
                    Shop Now
                </button>
            </div>
        `;
        updateSummary(0);
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.items.forEach((item, index) => {
        console.log(`[DISPLAY] Item ${index}:`, item);
        console.log(`[DISPLAY]   ID: ${item.id}, Product ID: ${item.product.id}, Name: ${item.product.name}, Qty: ${item.quantity}`);

        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.id = `cart-item-${item.id}`;
        
        div.innerHTML = `
            <img src="${item.product.imageUrl}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.product.name}</h3>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" data-product-id="${item.product.id}" data-item-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus-btn" data-product-id="${item.product.id}" data-item-id="${item.id}">+</button>
                </div>
                <button class="btn-remove" data-item-id="${item.id}" data-product-id="${item.product.id}">Remove</button>
            </div>
            <div class="cart-item-total">
                <strong>$${itemTotal.toFixed(2)}</strong>
            </div>
        `;
        
        container.appendChild(div);
    });

    // Now attach event listeners
    attachCartEventListeners();
    updateSummary(total);
}

function attachCartEventListeners() {
    console.log('[EVENTS] Attaching event listeners...');
    
    // Attach remove button listeners
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const itemId = this.getAttribute('data-item-id');
            console.log('[EVENTS] Remove button clicked for item:', itemId);
            removeItem(itemId);
        });
    });
    
    // Attach quantity button listeners
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.getAttribute('data-product-id');
            const itemId = this.getAttribute('data-item-id');
            const isPlus = this.classList.contains('plus-btn');
            
            const currentQtySpan = this.parentElement.querySelector('.quantity-value');
            const currentQty = parseInt(currentQtySpan.textContent, 10);
            const newQty = isPlus ? currentQty + 1 : currentQty - 1;
            
            console.log('[EVENTS] Quantity button clicked - Product:', productId, 'Item:', itemId, 'New Qty:', newQty);
            updateQuantity(productId, newQty);
        });
    });
}

function updateSummary(total) {
    document.getElementById('subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

async function updateQuantity(productId, quantity) {
    console.log('[QUANTITY] Updating product', productId, 'to quantity', quantity);
    
    if (quantity < 1) {
        // Remove item instead
        const item = cart.items.find(i => i.product.id == productId);
        if (item) {
            console.log('[QUANTITY] Quantity is 0, removing item:', item.id);
            removeItem(item.id);
        }
        return;
    }

    try {
        console.log('[QUANTITY] Sending update request...');
        
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: parseInt(productId, 10),
                quantity: quantity
            })
        });

        console.log('[QUANTITY] Response status:', response.status);
        const data = await response.json();
        console.log('[QUANTITY] Response data:', data);

        if (response.ok && data.success) {
            console.log('[QUANTITY] Quantity updated successfully');
            await loadCart();
        } else {
            console.error('[QUANTITY] Update failed:', data);
            alert('Failed to update quantity: ' + (data.message || 'Unknown error'));
            await loadCart();
        }
    } catch (error) {
        console.error('[QUANTITY] Error updating quantity:', error);
        alert('Error updating cart: ' + error.message);
    }
}

async function removeItem(itemId) {
    console.log('=== [REMOVE] REMOVING ITEM ===');
    console.log('[REMOVE] Item ID:', itemId);
    console.log('[REMOVE] Item ID Type:', typeof itemId);
    console.log('[REMOVE] User ID:', user.id);

    if (!confirm('Remove this item from cart?')) {
        console.log('[REMOVE] User cancelled');
        return;
    }

    try {
        const itemIdNum = parseInt(itemId, 10);
        
        if (isNaN(itemIdNum)) {
            console.error('[REMOVE] Invalid item ID:', itemId);
            alert('Invalid item ID');
            return;
        }
        
        const url = `${API_BASE_URL}/api/cart/${user.id}/item/${itemIdNum}`;
        console.log('[REMOVE] Calling DELETE', url);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('[REMOVE] Response status:', response.status);
        console.log('[REMOVE] Response ok:', response.ok);

        const data = await response.json();
        console.log('[REMOVE] Response body:', data);

        if (response.ok && data.success) {
            console.log('[REMOVE] Item removed successfully, reloading cart...');
            alert('Item removed from cart');
            await loadCart();
        } else if (response.ok) {
            console.log('[REMOVE] Successful response but success=false');
            alert('Failed to remove item: ' + (data.message || 'Unknown error'));
            await loadCart();
        } else {
            console.error('[REMOVE] HTTP Error:', response.status);
            alert('Error: ' + (data.message || 'Failed to remove item'));
        }
    } catch (error) {
        console.error('=== [REMOVE] EXCEPTION ===');
        console.error('[REMOVE] Error:', error);
        console.error('[REMOVE] Stack:', error.stack);
        alert('Error removing item: ' + error.message);
    }
}

function proceedToCheckout() {
    if (!cart || !cart.items || cart.items.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    sessionStorage.setItem('checkoutCart', JSON.stringify(cart.items));
    sessionStorage.setItem('checkoutTotal', total.toFixed(2));
    window.location.href = 'checkout.html';
}
