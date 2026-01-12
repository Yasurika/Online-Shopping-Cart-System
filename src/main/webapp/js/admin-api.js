/**
 * Admin API Integration Module
 * Handles all API calls for admin dashboard, analytics, and management
 * Author: Admin Developer (Person 6)
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Admin API Module
const AdminAPI = {
    
    // ==================== DASHBOARD STATS ====================
    
    /**
     * Get dashboard statistics (revenue, orders, users, products)
     */
    getDashboardStats: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch dashboard stats');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            this.showError('Failed to load dashboard statistics');
            return null;
        }
    },
    
    /**
     * Get total revenue
     */
    getTotalRevenue: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/total-revenue`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch revenue');
            const data = await response.json();
            return data.totalRevenue;
        } catch (error) {
            console.error('Error fetching total revenue:', error);
            return 0;
        }
    },
    
    /**
     * Get total orders count
     */
    getTotalOrders: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/total-orders`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch orders count');
            const data = await response.json();
            return data.totalOrders;
        } catch (error) {
            console.error('Error fetching total orders:', error);
            return 0;
        }
    },
    
    /**
     * Get total users count
     */
    getTotalUsers: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/total-users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch users count');
            const data = await response.json();
            return data.totalUsers;
        } catch (error) {
            console.error('Error fetching total users:', error);
            return 0;
        }
    },
    
    /**
     * Get total products count
     */
    getTotalProducts: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/total-products`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch products count');
            const data = await response.json();
            return data.totalProducts;
        } catch (error) {
            console.error('Error fetching total products:', error);
            return 0;
        }
    },
    
    // ==================== SALES ANALYTICS ====================
    
    /**
     * Get sales data for chart (revenue over time)
     * @param {String} period - 'daily', 'weekly', 'monthly', 'yearly'
     */
    getSalesAnalytics: async function(period = 'daily') {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/sales?period=${period}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch sales analytics');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching sales analytics:', error);
            this.showError('Failed to load sales analytics');
            return [];
        }
    },
    
    /**
     * Get category-wise sales breakdown
     */
    getCategorySalesAnalytics: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/category-sales`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch category sales');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching category sales:', error);
            return [];
        }
    },
    
    /**
     * Get top performing products
     */
    getTopProducts: async function(limit = 10) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/analytics/top-products?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch top products');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching top products:', error);
            return [];
        }
    },
    
    // ==================== ORDERS MANAGEMENT ====================
    
    /**
     * Get all orders with pagination
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     * @param {String} status - Filter by order status (optional)
     */
    getAllOrders: async function(page = 1, limit = 10, status = null) {
        try {
            let url = `${API_BASE_URL}/admin/orders?page=${page}&limit=${limit}`;
            if (status) url += `&status=${status}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            this.showError('Failed to load orders');
            return { orders: [], total: 0 };
        }
    },
    
    /**
     * Get single order details
     * @param {Number} orderId
     */
    getOrderDetails: async function(orderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch order details');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            this.showError('Failed to load order details');
            return null;
        }
    },
    
    /**
     * Update order status
     * @param {Number} orderId
     * @param {String} status - New status
     */
    updateOrderStatus: async function(orderId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ status: status })
            });
            
            if (!response.ok) throw new Error('Failed to update order status');
            const data = await response.json();
            this.showSuccess('Order status updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showError('Failed to update order status');
            return null;
        }
    },
    
    // ==================== USERS MANAGEMENT ====================
    
    /**
     * Get all users with pagination
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     */
    getAllUsers: async function(page = 1, limit = 10) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching users:', error);
            this.showError('Failed to load users');
            return { users: [], total: 0 };
        }
    },
    
    /**
     * Get user details
     * @param {Number} userId
     */
    getUserDetails: async function(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch user details');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            this.showError('Failed to load user details');
            return null;
        }
    },
    
    /**
     * Deactivate/activate user
     * @param {Number} userId
     * @param {Boolean} isActive
     */
    updateUserStatus: async function(userId, isActive) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ isActive: isActive })
            });
            
            if (!response.ok) throw new Error('Failed to update user status');
            const data = await response.json();
            this.showSuccess('User status updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating user status:', error);
            this.showError('Failed to update user status');
            return null;
        }
    },
    
    /**
     * Get user's orders
     * @param {Number} userId
     */
    getUserOrders: async function(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/orders`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch user orders');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    },
    
    // ==================== PRODUCTS MANAGEMENT ====================
    
    /**
     * Get all products for admin
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     */
    getAllProducts: async function(page = 1, limit = 10) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            this.showError('Failed to load products');
            return { products: [], total: 0 };
        }
    },
    
    /**
     * Create new product
     * @param {Object} productData
     */
    createProduct: async function(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) throw new Error('Failed to create product');
            const data = await response.json();
            this.showSuccess('Product created successfully');
            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            this.showError('Failed to create product');
            return null;
        }
    },
    
    /**
     * Update product
     * @param {Number} productId
     * @param {Object} productData
     */
    updateProduct: async function(productId, productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) throw new Error('Failed to update product');
            const data = await response.json();
            this.showSuccess('Product updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            this.showError('Failed to update product');
            return null;
        }
    },
    
    /**
     * Delete product
     * @param {Number} productId
     */
    deleteProduct: async function(productId) {
        try {
            if (!confirm('Are you sure you want to delete this product?')) {
                return false;
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to delete product');
            this.showSuccess('Product deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showError('Failed to delete product');
            return false;
        }
    },
    
    /**
     * Update product stock
     * @param {Number} productId
     * @param {Number} quantity
     */
    updateProductStock: async function(productId, quantity) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/stock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ quantity: quantity })
            });
            
            if (!response.ok) throw new Error('Failed to update stock');
            const data = await response.json();
            this.showSuccess('Stock updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating stock:', error);
            this.showError('Failed to update stock');
            return null;
        }
    },
    
    // ==================== CATEGORIES MANAGEMENT ====================
    
    /**
     * Get all categories
     */
    getAllCategories: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categories`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },
    
    /**
     * Create new category
     * @param {Object} categoryData
     */
    createCategory: async function(categoryData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(categoryData)
            });
            
            if (!response.ok) throw new Error('Failed to create category');
            const data = await response.json();
            this.showSuccess('Category created successfully');
            return data;
        } catch (error) {
            console.error('Error creating category:', error);
            this.showError('Failed to create category');
            return null;
        }
    },
    
    /**
     * Update category
     * @param {Number} categoryId
     * @param {Object} categoryData
     */
    updateCategory: async function(categoryId, categoryData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(categoryData)
            });
            
            if (!response.ok) throw new Error('Failed to update category');
            const data = await response.json();
            this.showSuccess('Category updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating category:', error);
            this.showError('Failed to update category');
            return null;
        }
    },
    
    /**
     * Delete category
     * @param {Number} categoryId
     */
    deleteCategory: async function(categoryId) {
        try {
            if (!confirm('Are you sure you want to delete this category?')) {
                return false;
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to delete category');
            this.showSuccess('Category deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showError('Failed to delete category');
            return false;
        }
    },
    
    // ==================== REPORTS ====================
    
    /**
     * Generate sales report
     * @param {String} startDate - YYYY-MM-DD format
     * @param {String} endDate - YYYY-MM-DD format
     */
    generateSalesReport: async function(startDate, endDate) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/sales?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to generate report');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating sales report:', error);
            this.showError('Failed to generate sales report');
            return null;
        }
    },
    
    /**
     * Generate inventory report
     */
    generateInventoryReport: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/inventory`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to generate inventory report');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating inventory report:', error);
            this.showError('Failed to generate inventory report');
            return null;
        }
    },
    
    /**
     * Export report to CSV
     * @param {String} reportType - 'sales', 'inventory', 'users'
     */
    exportReport: async function(reportType, data) {
        try {
            let csvContent = 'data:text/csv;charset=utf-8,';
            
            if (reportType === 'sales') {
                csvContent += 'Date,Revenue,Orders,Customers\n';
                data.forEach(row => {
                    csvContent += `${row.date},${row.revenue},${row.orders},${row.customers}\n`;
                });
            }
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Report exported successfully');
        } catch (error) {
            console.error('Error exporting report:', error);
            this.showError('Failed to export report');
        }
    },
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Get authentication token from localStorage
     */
    getAuthToken: function() {
        return localStorage.getItem('authToken') || '';
    },
    
    /**
     * Show success message
     * @param {String} message
     */
    showSuccess: function(message) {
        // Using browser alert for now, can be replaced with toast notification
        const notification = document.createElement('div');
        notification.className = 'admin-notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 9999;
            animation: slideIn 0.3s ease-in;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    },
    
    /**
     * Show error message
     * @param {String} message
     */
    showError: function(message) {
        const notification = document.createElement('div');
        notification.className = 'admin-notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 9999;
            animation: slideIn 0.3s ease-in;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    },
    
    /**
     * Check if user is admin
     */
    isAdmin: function() {
        const userRole = localStorage.getItem('userRole');
        return userRole === 'ADMIN';
    },
    
    /**
     * Redirect to login if not authenticated
     */
    checkAuth: function() {
        const token = this.getAuthToken();
        if (!token) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }
};

// Initialize admin on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!AdminAPI.checkAuth()) {
        return;
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAPI;
}
