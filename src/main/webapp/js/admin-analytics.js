/**
 * Admin Analytics JavaScript
 * Handles all analytics dashboard functionality, charts, filters, and exports
 * Author: Admin Developer (Person 6)
 */

// Chart instances storage
let charts = {
    revenue: null,
    product: null,
    customer: null,
    payment: null,
    order: null
};

// Initialize analytics on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!AdminAPI.checkAuth()) {
        return;
    }
    
    loadAnalyticsData();
    initializeCharts();
});

/**
 * Load all analytics data from API
 */
function loadAnalyticsData() {
    try {
        // Load revenue analytics
        AdminAPI.getSalesAnalytics('monthly').then(data => {
            updateRevenueChart(data);
        });
        
        // Load product analytics
        AdminAPI.getTopProducts(10).then(data => {
            updateProductChart(data);
            updateTopProductsTable(data);
        });
        
        // Load customer analytics
        AdminAPI.getTotalUsers().then(count => {
            document.getElementById('totalCustomers').textContent = count;
        });
        
        // Load order analytics
        AdminAPI.getAllOrders(1, 100).then(data => {
            updateOrderChart(data);
        });
        
        // Set default date range (last 30 days)
        setDefaultDateRange();
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
        AdminAPI.showError('Failed to load analytics data');
    }
}

/**
 * Initialize all charts
 */
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [30000, 35000, 32000, 45000, 52000, 58000, 61000, 65000, 70000, 125450],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Expenses',
                    data: [15000, 16000, 14000, 20000, 23000, 25000, 27000, 28000, 30000, 45230],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#e74c3c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Product Chart
    const productCtx = document.getElementById('productChart').getContext('2d');
    charts.product = new Chart(productCtx, {
        type: 'bar',
        data: {
            labels: ['Laptop Pro', 'Wireless Mouse', 'USB Hub', 'Keyboard', 'Monitor'],
            datasets: [{
                label: 'Units Sold',
                data: [1245, 3456, 2891, 2145, 1876],
                backgroundColor: [
                    '#3498db',
                    '#27ae60',
                    '#f39c12',
                    '#e74c3c',
                    '#9b59b6'
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Customer Chart
    const customerCtx = document.getElementById('customerChart').getContext('2d');
    charts.customer = new Chart(customerCtx, {
        type: 'doughnut',
        data: {
            labels: ['VIP Customers', 'Regular Customers', 'New Customers', 'At-Risk', 'Dormant'],
            datasets: [{
                data: [450, 2300, 342, 280, 128],
                backgroundColor: [
                    '#3498db',
                    '#27ae60',
                    '#f39c12',
                    '#e74c3c',
                    '#95a5a6'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Payment Chart
    const paymentCtx = document.getElementById('paymentChart').getContext('2d');
    charts.payment = new Chart(paymentCtx, {
        type: 'pie',
        data: {
            labels: ['Credit Card', 'Debit Card', 'Digital Wallet', 'UPI', 'COD'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#3498db',
                    '#27ae60',
                    '#f39c12',
                    '#e74c3c',
                    '#95a5a6'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Order Chart
    const orderCtx = document.getElementById('orderChart').getContext('2d');
    charts.order = new Chart(orderCtx, {
        type: 'bar',
        data: {
            labels: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
            datasets: [{
                label: 'Orders',
                data: [125, 245, 890, 1196, 32],
                backgroundColor: [
                    '#f39c12',
                    '#3498db',
                    '#27ae60',
                    '#27ae60',
                    '#e74c3c'
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Update revenue chart with data
 */
function updateRevenueChart(data) {
    if (charts.revenue) {
        charts.revenue.data.labels = data.map(item => item.date);
        charts.revenue.data.datasets[0].data = data.map(item => item.revenue);
        charts.revenue.update();
    }
}

/**
 * Update product chart with data
 */
function updateProductChart(data) {
    if (charts.product && data && data.length > 0) {
        charts.product.data.labels = data.map(item => item.name);
        charts.product.data.datasets[0].data = data.map(item => item.unitsSold);
        charts.product.update();
    }
}

/**
 * Update top products table
 */
function updateTopProductsTable(data) {
    const tbody = document.getElementById('topProductsTable');
    if (!tbody || !data) return;

    let html = '';
    data.forEach((product, index) => {
        const margin = ((product.profit / product.revenue) * 100).toFixed(1);
        const trendClass = product.growth >= 0 ? 'trend-up' : 'trend-down';
        const arrow = product.growth >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${product.name}</td>
                <td>${product.unitsSold.toLocaleString()}</td>
                <td>$${product.revenue.toLocaleString()}</td>
                <td>$${product.profit.toLocaleString()}</td>
                <td class="${trendClass}">${margin}%</td>
                <td><i class="fas fa-star" style="color: #f39c12;"></i> ${product.rating}/5</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/**
 * Update order chart with data
 */
function updateOrderChart(data) {
    if (charts.order && data) {
        const statusCounts = {
            pending: 0,
            confirmed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        data.orders?.forEach(order => {
            const status = order.status.toLowerCase();
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        charts.order.data.datasets[0].data = [
            statusCounts.pending,
            statusCounts.confirmed,
            statusCounts.shipped,
            statusCounts.delivered,
            statusCounts.cancelled
        ];
        charts.order.update();
    }
}

/**
 * Set default date range (last 30 days)
 */
function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    document.getElementById('dateFrom').valueAsDate = thirtyDaysAgo;
    document.getElementById('dateTo').valueAsDate = today;
}

/**
 * Apply filters
 */
function applyFilters() {
    const filters = {
        dateFrom: document.getElementById('dateFrom').value,
        dateTo: document.getElementById('dateTo').value,
        period: document.getElementById('period').value,
        category: document.getElementById('category').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        region: document.getElementById('region').value
    };

    console.log('Applying filters:', filters);
    
    // Reload analytics data with filters
    AdminAPI.getSalesAnalytics(filters.period).then(data => {
        updateRevenueChart(data);
    });

    AdminAPI.showSuccess('Filters applied successfully');
}

/**
 * Reset filters
 */
function resetFilters() {
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('period').value = 'monthly';
    document.getElementById('category').value = '';
    document.getElementById('paymentMethod').value = '';
    document.getElementById('region').value = '';

    setDefaultDateRange();
    loadAnalyticsData();
    AdminAPI.showSuccess('Filters reset');
}

/**
 * Download chart as image
 */
function downloadChart(chartName) {
    if (!charts[chartName]) {
        AdminAPI.showError('Chart not found');
        return;
    }

    const canvas = charts[chartName].canvas;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chartName}_chart_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    AdminAPI.showSuccess('Chart downloaded successfully');
}

/**
 * Toggle chart expansion
 */
function toggleChart(chartName) {
    const canvas = document.getElementById(chartName + 'Chart');
    if (canvas) {
        canvas.parentElement.style.minHeight = 
            canvas.parentElement.style.minHeight === '600px' ? '300px' : '600px';
        
        // Re-render chart
        if (charts[chartName]) {
            charts[chartName].resize();
        }
    }
}

/**
 * Export table data
 */
function exportTable(tableName) {
    const table = document.querySelector('.analytics-table');
    if (!table) {
        AdminAPI.showError('Table not found');
        return;
    }

    const csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => {
            csvRow.push('"' + col.textContent + '"');
        });
        csv.push(csvRow.join(','));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    AdminAPI.showSuccess('Table exported successfully');
}

/**
 * Sort table by column
 */
function sortTable(tableName, columnIndex) {
    const table = document.querySelector('.analytics-table');
    let shouldSort = true;

    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    rows.sort((a, b) => {
        const aValue = a.querySelectorAll('td')[columnIndex].textContent.trim();
        const bValue = b.querySelectorAll('td')[columnIndex].textContent.trim();

        // Try numeric sort first
        const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
        const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }

        // Fall back to string sort
        return aValue.localeCompare(bValue);
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));

    AdminAPI.showSuccess('Table sorted');
}

/**
 * Export data in specified format
 */
function exportData(format) {
    console.log('Exporting data as:', format);

    switch(format) {
        case 'pdf':
            AdminAPI.showSuccess('Generating PDF report...');
            // Implement PDF export
            break;
        case 'excel':
            AdminAPI.showSuccess('Exporting to Excel...');
            // Implement Excel export
            break;
        case 'csv':
            AdminAPI.showSuccess('Exporting to CSV...');
            // Implement CSV export
            break;
        default:
            AdminAPI.showError('Unknown export format');
    }
}

/**
 * Schedule report generation
 */
function scheduleReport() {
    const frequency = prompt('Enter report frequency (daily/weekly/monthly):', 'weekly');
    if (frequency) {
        const recipient = prompt('Enter email recipient:', '');
        if (recipient) {
            AdminAPI.showSuccess(`Report scheduled to be sent ${frequency} to ${recipient}`);
        }
    }
}

/**
 * Email report to recipients
 */
function emailReport() {
    const recipient = prompt('Enter email address to send report to:', '');
    if (recipient && recipient.includes('@')) {
        AdminAPI.showSuccess(`Report sent to ${recipient}`);
    } else if (recipient) {
        AdminAPI.showError('Invalid email address');
    }
}

/**
 * Update stats on page
 */
function updateStats() {
    AdminAPI.getTotalRevenue().then(revenue => {
        document.getElementById('totalRevenue').textContent = '$' + revenue.toLocaleString();
    });

    AdminAPI.getTotalOrders().then(orders => {
        document.getElementById('totalOrders').textContent = orders.toLocaleString();
    });
}

/**
 * Refresh all analytics data
 */
function refreshAnalytics() {
    console.log('Refreshing analytics...');
    loadAnalyticsData();
    updateStats();
    AdminAPI.showSuccess('Analytics refreshed');
}

// Auto-refresh analytics every 5 minutes
setInterval(function() {
    console.log('Auto-refreshing analytics...');
    // Uncomment to enable auto-refresh
    // refreshAnalytics();
}, 5 * 60 * 1000);
