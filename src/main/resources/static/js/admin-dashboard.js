// Check admin authentication
const admin = checkAdmin();

if (admin) {
    document.getElementById('adminName').textContent = admin.fullName || admin.username;
    loadDashboard();
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

async function loadDashboard() {
    try {
        console.log('Loading dashboard statistics...');

        // Load statistics
        const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`);
        const stats = await statsResponse.json();

        console.log('Dashboard stats:', stats);

        // Update stats cards
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = '$' + (stats.totalRevenue || 0).toFixed(2);
        document.getElementById('lowStock').textContent = stats.lowStockProducts || 0;
        document.getElementById('todayOrders').textContent = stats.todayOrders || 0;

        // Load charts
        loadCharts();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Failed to load dashboard data');
    }
}

async function loadCharts() {
    try {
        // Sales Chart
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sales',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Category Chart
        const categoryResponse = await fetch(`${API_BASE_URL}/api/products`);
        const products = await categoryResponse.json();

        // Count products by category
        const categoryCounts = {};
        products.forEach(product => {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        });

        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryCounts),
                datasets: [{
                    data: Object.values(categoryCounts),
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b',
                        '#fa709a',
                        '#fee140',
                        '#30cfd0',
                        '#a8edea',
                        '#fed6e3',
                        '#c471f5'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin');
        window.location.href = 'admin-login.html';
    }
}