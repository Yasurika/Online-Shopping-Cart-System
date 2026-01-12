// Check admin authentication
const admin = checkAdmin();

if (admin) {
    document.getElementById('adminName').textContent = admin.fullName || admin.username;
    initializeDateFilters();
    updateReports();
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

function initializeDateFilters() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    document.getElementById('endDate').valueAsDate = today;
    document.getElementById('startDate').valueAsDate = thirtyDaysAgo;
}

function showReport(reportType) {
    // Hide all reports
    document.querySelectorAll('.report-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Hide all tabs
    document.querySelectorAll('.report-tab').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected report
    const reportId = reportType + 'Report';
    document.getElementById(reportId).classList.add('active');
    
    // Highlight active tab
    event.target.classList.add('active');
}

async function updateReports() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        console.log('Loading reports for date range:', startDate, 'to', endDate);
        
        // Load all reports
        await loadSalesReport(startDate, endDate);
        await loadInventoryReport();
        await loadCategoryAnalytics();
        await loadLowStockAlerts();
        
    } catch (error) {
        console.error('Error updating reports:', error);
        alert('Failed to load reports');
    }
}

async function loadSalesReport(startDate, endDate) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/sales?startDate=${startDate}&endDate=${endDate}`);
        const salesData = await response.json();
        
        console.log('Sales report data:', salesData);
        
        // Calculate totals
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalCustomers = 0;
        let avgOrderValue = 0;
        
        salesData.forEach(day => {
            totalRevenue += parseFloat(day.totalRevenue || 0);
            totalOrders += day.totalOrders || 0;
            totalCustomers += day.totalCustomers || 0;
        });
        
        if (totalOrders > 0) {
            avgOrderValue = totalRevenue / totalOrders;
        }
        
        // Update summary
        document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);
        document.getElementById('totalOrdersCount').textContent = totalOrders;
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('avgOrderValue').textContent = '$' + avgOrderValue.toFixed(2);
        
        // Draw chart
        drawSalesChart(salesData);
        
        // Create table
        createSalesTable(salesData);
        
    } catch (error) {
        console.error('Error loading sales report:', error);
    }
}

function drawSalesChart(salesData) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Clear existing chart if any
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    
    const labels = salesData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const revenueData = salesData.map(d => parseFloat(d.totalRevenue || 0));
    const orderData = salesData.map(d => d.totalOrders || 0);
    
    window.salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: revenueData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Orders',
                    data: orderData,
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue ($)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Orders'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function createSalesTable(salesData) {
    const tableHtml = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Customers</th>
                    <th>Avg Order Value</th>
                </tr>
            </thead>
            <tbody>
                ${salesData.map(day => `
                    <tr>
                        <td>${new Date(day.date).toLocaleDateString()}</td>
                        <td>${day.totalOrders}</td>
                        <td>$${parseFloat(day.totalRevenue).toFixed(2)}</td>
                        <td>${day.totalCustomers}</td>
                        <td>$${parseFloat(day.averageOrderValue).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('salesTable').innerHTML = tableHtml;
}

async function loadInventoryReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/inventory`);
        const inventory = await response.json();
        
        console.log('Inventory data:', inventory);
        
        // Calculate totals
        let totalValue = 0;
        inventory.forEach(item => {
            totalValue += parseFloat(item.totalValue || 0);
        });
        
        document.getElementById('inventoryTotalProducts').textContent = inventory.length;
        document.getElementById('inventoryTotalValue').textContent = '$' + totalValue.toFixed(2);
        
        // Create table
        const tableBody = document.getElementById('inventoryTableBody');
        tableBody.innerHTML = inventory.map(item => `
            <tr class="${item.isLowStock ? 'low-stock' : ''}">
                <td>${item.productName}</td>
                <td>${item.category}</td>
                <td>${item.stockQuantity}</td>
                <td>$${parseFloat(item.totalValue).toFixed(2)}</td>
                <td>
                    <span class="status-badge ${item.isLowStock ? 'warning' : 'success'}">
                        ${item.isLowStock ? '⚠️ Low Stock' : '✓ In Stock'}
                    </span>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading inventory report:', error);
    }
}

async function loadCategoryAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/analytics/category`);
        const categories = await response.json();
        
        console.log('Category analytics:', categories);
        
        // Draw chart
        drawCategoryChart(categories);
        
        // Create table
        const tableBody = document.getElementById('categoryTableBody');
        tableBody.innerHTML = categories.map(cat => `
            <tr>
                <td><strong>${cat.category}</strong></td>
                <td>${cat.totalProducts}</td>
                <td>$${parseFloat(cat.totalRevenue).toFixed(2)}</td>
                <td>$${parseFloat(cat.averagePrice).toFixed(2)}</td>
                <td>${cat.totalStock} units</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading category analytics:', error);
    }
}

function drawCategoryChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
        '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3', '#c471f5'
    ];
    
    window.categoryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(c => c.category),
            datasets: [{
                label: 'Products',
                data: categories.map(c => c.totalProducts),
                backgroundColor: colors.slice(0, categories.length),
                borderColor: colors.slice(0, categories.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function loadLowStockAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/inventory/low-stock`);
        const lowStockItems = await response.json();
        
        console.log('Low stock items:', lowStockItems);
        
        // Update count
        document.getElementById('lowStockCount').textContent = 
            `⚠️ ${lowStockItems.length} product(s) with low stock`;
        
        // Create table
        const tableBody = document.getElementById('lowstockTableBody');
        tableBody.innerHTML = lowStockItems.map(item => `
            <tr class="alert-row">
                <td><strong>${item.productName}</strong></td>
                <td>${item.category}</td>
                <td class="stock-low">${item.stockQuantity}</td>
                <td>${item.lowStockThreshold}</td>
                <td>
                    <button class="btn-action" onclick="reorderProduct(${item.productId})">
                        Reorder
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading low stock alerts:', error);
    }
}

function reorderProduct(productId) {
    const quantity = prompt('Enter reorder quantity:');
    if (quantity) {
        alert(`Reorder request for ${quantity} units submitted!`);
    }
}

function exportToCSV() {
    alert('CSV export feature coming soon!');
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin');
        window.location.href = 'admin-login.html';
    }
}
