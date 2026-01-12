// Check admin authentication
const admin = checkAdmin();
let allProducts = [];
let filteredProducts = [];

// Comprehensive categories list
const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Sports',
    'Home',
    'Books',
    'Beauty',
    'Toys',
    'Office',
    'Automotive',
    'Pets',
    'Garden',
    'Food & Beverages',
    'Jewelry',
    'Music',
    'Video Games',
    'Furniture',
    'Tools',
    'Health',
    'Sports Equipment',
    'Clothing',
    'Shoes',
    'Bags',
    'Watches',
    'Sunglasses',
    'Accessories',
    'Camping',
    'Outdoor',
    'Kitchen',
    'Bathroom',
    'Bedding',
    'Lighting',
    'Decor',
    'Cleaning',
    'Safety'
];

if (admin) {
    loadProducts();
    loadCategories();
    setupSearchListener();
    initializeCategorySelects();
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

async function loadProducts() {
    try {
        console.log('Loading products...');

        const response = await fetch(`${API_BASE_URL}/api/products`);
        allProducts = await response.json();
        filteredProducts = allProducts;

        console.log('Products loaded:', allProducts.length);
        displayProducts(filteredProducts);

    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products');
    }
}

function initializeCategorySelects() {
    const productCategory = document.getElementById('productCategory');
    
    // Clear existing options except the first one
    while (productCategory.options.length > 1) {
        productCategory.remove(1);
    }
    
    // Add all predefined categories
    CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        productCategory.appendChild(option);
    });
}

function loadCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    const categoryFilter = document.getElementById('categoryFilter');

    // Keep "All Categories" option and add dynamic categories
    categories.forEach(category => {
        if (category && !Array.from(categoryFilter.options).some(opt => opt.value === category)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #9CA3AF;">
                    No products found
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');

        // Determine stock status
        let stockBadge = '';
        let stockClass = '';

        if (product.stockQuantity === 0) {
            stockBadge = 'Out of Stock';
            stockClass = 'out-of-stock';
        } else if (product.stockQuantity < 20) {
            stockBadge = 'Low Stock';
            stockClass = 'low-stock';
        } else {
            stockBadge = 'In Stock';
            stockClass = 'in-stock';
        }

        const imageUrl = product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <img src="${imageUrl}" alt="${product.name}" class="product-image"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect width=%2260%22 height=%2260%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2212%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
            </td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stockQuantity}</td>
            <td><span class="stock-badge ${stockClass}">${stockBadge}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id}, '${product.name}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function setupSearchListener() {
    const searchInput = document.getElementById('searchProducts');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterProducts();
        }, 300);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;

    filteredProducts = allProducts.filter(product => {
        // Search filter
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = !categoryFilter || product.category === categoryFilter;

        // Stock filter
        let matchesStock = true;
        if (stockFilter === 'in-stock') {
            matchesStock = product.stockQuantity >= 20;
        } else if (stockFilter === 'low-stock') {
            matchesStock = product.stockQuantity > 0 && product.stockQuantity < 20;
        } else if (stockFilter === 'out-of-stock') {
            matchesStock = product.stockQuantity === 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    displayProducts(filteredProducts);
}

function showAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    // Save scroll position before opening modal
    window.scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollPosition}px`;
    document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
    // Restore scroll position
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.top = 'auto';
    window.scrollTo(0, window.scrollPosition || 0);
}

async function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stockQuantity;
    document.getElementById('productImage').value = product.imageUrl || '';

    // Save scroll position before opening modal
    window.scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollPosition}px`;
    document.getElementById('productModal').classList.add('show');
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    }
}

// Product form submission
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stockQuantity: parseInt(document.getElementById('productStock').value),
        imageUrl: document.getElementById('productImage').value || 'https://via.placeholder.com/400?text=No+Image'
    };

    try {
        let response;

        if (productId) {
            // Update existing product
            response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch(`${API_BASE_URL}/api/admin/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }

        const data = await response.json();

        if (data.success) {
            alert(productId ? 'Product updated successfully!' : 'Product added successfully!');
            closeProductModal();
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product');
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin');
        window.location.href = 'admin-login.html';
    }
}