const user = checkAuth();
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Category configuration
const categories = [
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
    'Garden'
];

const categoryIcons = {
    'Electronics': '💻',
    'Fashion': '👗',
    'Sports': '⚽',
    'Home': '🏠',
    'Books': '📚',
    'Beauty': '💄',
    'Toys': '🎮',
    'Office': '📝',
    'Automotive': '🚗',
    'Pets': '🐾',
    'Garden': '🌱'
};

if (user) {
    document.getElementById('userName').textContent = user.fullName || user.username;
    loadProducts();
    loadCartCount();
}

async function loadProducts() {
    try {
        document.getElementById('loading').classList.add('show');

        const response = await fetch(`${API_BASE_URL}/api/products`);
        allProducts = await response.json();
        filteredProducts = allProducts;

        // Update stats
        document.getElementById('totalProducts').textContent = allProducts.length;

        // Update category counts
        updateCategoryCounts();

        // Show all products initially
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    } finally {
        document.getElementById('loading').classList.remove('show');
    }
}

function updateCategoryCounts() {
    categories.forEach(category => {
        const count = allProducts.filter(p => p.category === category).length;
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            countElement.textContent = `${count} items`;
        }
    });
}

function filterByCategory(category) {
    currentCategory = category;

    // Show quick filters
    document.getElementById('quickFilters').style.display = 'block';

    // Update filter title
    const categoryIcon = categoryIcons[category] || '📦';
    document.getElementById('filterTitle').textContent = `${categoryIcon} ${category}`;

    // Update active filter tag
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.classList.remove('active');
        if (tag.textContent.includes(category)) {
            tag.classList.add('active');
        }
    });

    // Filter products
    filteredProducts = allProducts.filter(p => p.category === category);
    displayProducts(filteredProducts);

    // Scroll to products
    document.getElementById('productsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function showAllProducts() {
    currentCategory = 'all';
    filteredProducts = allProducts;

    // Hide quick filters
    document.getElementById('quickFilters').style.display = 'none';

    // Update filter title
    document.getElementById('filterTitle').textContent = 'All Products';

    // Update active filter tag
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.classList.remove('active');
    });
    filterTags[0]?.classList.add('active'); // First tag is "All"

    displayProducts(allProducts);

    // Scroll to products
    document.getElementById('productsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = '';

    if (products.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;

        // Stock status
        let stockClass = 'in-stock';
        let stockText = `${product.stockQuantity} in stock`;

        if (product.stockQuantity === 0) {
            stockClass = 'out-of-stock';
            stockText = 'Out of stock';
        } else if (product.stockQuantity < 20) {
            stockClass = 'low-stock';
            stockText = `Only ${product.stockQuantity} left`;
        }

        // Badge
        let badge = '';
        if (product.stockQuantity > 100) {
            badge = '<div class="product-badge new">Popular</div>';
        } else if (product.stockQuantity < 30 && product.stockQuantity > 0) {
            badge = '<div class="product-badge sale">Limited</div>';
        }

        // Fallback image
        const fallbackImage = `https://via.placeholder.com/400x400/6C63FF/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 15))}`;
        const categoryIcon = categoryIcons[product.category] || '📦';

        card.innerHTML = `
            ${badge}
            <div class="product-image-wrapper">
                <img src="${product.imageUrl}"
                     alt="${product.name}"
                     class="product-image"
                     onerror="this.onerror=null; this.src='${fallbackImage}';"
                     loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${categoryIcon} ${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-stock ${stockClass}">${stockText}</div>
                <div class="product-footer">
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <button class="btn-add-cart"
                            onclick="addToCart(${product.id})"
                            ${product.stockQuantity === 0 ? 'disabled' : ''}>
                        ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    let sorted = [...filteredProducts];

    switch(sortValue) {
        case 'price-low':
            sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'name-az':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-za':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Keep original order
            break;
    }

    displayProducts(sorted);
}

async function addToCart(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: productId, quantity: 1 })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Product added to cart!', 'success');
            loadCartCount();
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add to cart', 'error');
    }
}

async function loadCartCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
        const cart = await response.json();
        const count = cart.items?.length || 0;
        document.getElementById('cartBadge').textContent = count;
    } catch (error) {
        console.error('Error loading cart count:', error);
    }
}

// Search functionality
let searchTimeout;
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            filteredProducts = currentCategory === 'all'
                ? allProducts
                : allProducts.filter(p => p.category === currentCategory);
        } else {
            const baseProducts = currentCategory === 'all'
                ? allProducts
                : allProducts.filter(p => p.category === currentCategory);

            filteredProducts = baseProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        displayProducts(filteredProducts);
    }, 300);
});

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.style.background = type === 'error' ? '#e74c3c' : 'var(--success)';
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}