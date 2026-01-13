// Order Management Module

let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Generate unique order ID
function generateOrderId() {
    return "ORD-" + Date.now();
}

// Place a new order
function placeOrder(cartItems, totalAmount, customer) {
    if (cartItems.length === 0) {
        alert("Cart is empty. Cannot place order.");
        return;
    }

    const order = {
        orderId: generateOrderId(),
        items: cartItems,
        total: totalAmount,
        customer: customer,
        status: "Pending",
        orderDate: new Date().toLocaleString()
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    return order;
}

// Get all orders
function getAllOrders() {
    return orders;
}

// Get order by ID
function getOrderById(orderId) {
    return orders.find(order => order.orderId === orderId);
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const order = getOrderById(orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem("orders", JSON.stringify(orders));
        return true;
    }
    return false;
}

// Delete an order
function deleteOrder(orderId) {
    orders = orders.filter(order => order.orderId !== orderId);
    localStorage.setItem("orders", JSON.stringify(orders));
}
