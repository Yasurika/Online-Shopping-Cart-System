package com.example.Shopping.Cart.service;

import com.example.Shopping.Cart.dto.CategoryAnalyticsDTO;
import com.example.Shopping.Cart.dto.InventoryReportDTO;
import com.example.Shopping.Cart.dto.SalesReportDTO;
import com.example.Shopping.Cart.model.Order;
import com.example.Shopping.Cart.model.Product;
import com.example.Shopping.Cart.repository.OrderRepository;
import com.example.Shopping.Cart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportingService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Generate sales report for date range
     */
    public List<SalesReportDTO> generateSalesReport(LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, List<Order>> ordersByDate = new TreeMap<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
            
            List<Order> dailyOrders = orderRepository.findByCreatedAtBetween(dayStart, dayEnd);
            ordersByDate.put(date, dailyOrders);
        }

        return ordersByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<Order> orders = entry.getValue();
                    
                    long totalOrders = orders.size();
                    BigDecimal totalRevenue = orders.stream()
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    long totalCustomers = orders.stream()
                            .map(o -> o.getUser().getId())
                            .distinct()
                            .count();
                    
                    BigDecimal averageOrderValue = totalOrders > 0 
                            ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    
                    return new SalesReportDTO(date, totalOrders, totalRevenue, totalCustomers, averageOrderValue);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get inventory status report
     */
    public List<InventoryReportDTO> generateInventoryReport() {
        return productRepository.findAll().stream()
                .map(product -> {
                    boolean isLowStock = product.getStockQuantity() < 30;
                    BigDecimal totalValue = product.getPrice()
                            .multiply(BigDecimal.valueOf(product.getStockQuantity()));
                    
                    return new InventoryReportDTO(
                            product.getId(),
                            product.getName(),
                            product.getCategory(),
                            product.getStockQuantity(),
                            30,
                            isLowStock,
                            totalValue
                    );
                })
                .sorted(Comparator.comparing(InventoryReportDTO::getStockQuantity))
                .collect(Collectors.toList());
    }

    /**
     * Get low stock alerts
     */
    public List<InventoryReportDTO> getLowStockAlerts() {
        return generateInventoryReport().stream()
                .filter(InventoryReportDTO::getIsLowStock)
                .collect(Collectors.toList());
    }

    /**
     * Get category analytics
     */
    public List<CategoryAnalyticsDTO> getCategoryAnalytics() {
        List<Product> allProducts = productRepository.findAll();
        
        return allProducts.stream()
                .collect(Collectors.groupingBy(Product::getCategory))
                .entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    List<Product> products = entry.getValue();
                    
                    long totalProducts = products.size();
                    BigDecimal totalRevenue = products.stream()
                            .map(Product::getPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal averagePrice = totalProducts > 0
                            ? totalRevenue.divide(BigDecimal.valueOf(totalProducts), 2, java.math.RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    
                    Integer totalStock = products.stream()
                            .mapToInt(Product::getStockQuantity)
                            .sum();
                    
                    // Calculate sales for this category
                    long totalSales = 0; // Can be enhanced with order_items join
                    
                    return new CategoryAnalyticsDTO(
                            category,
                            totalProducts,
                            totalSales,
                            totalRevenue,
                            averagePrice,
                            totalStock
                    );
                })
                .sorted(Comparator.comparing(CategoryAnalyticsDTO::getTotalRevenue).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard summary
     */
    public Map<String, Object> getDashboardSummary(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> summary = new HashMap<>();
        
        // Sales data
        List<SalesReportDTO> salesReport = generateSalesReport(startDate, endDate);
        BigDecimal totalRevenue = salesReport.stream()
                .map(SalesReportDTO::getTotalRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalOrders = salesReport.stream()
                .mapToLong(SalesReportDTO::getTotalOrders)
                .sum();
        
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalOrders", totalOrders);
        summary.put("totalCustomers", salesReport.stream()
                .mapToLong(SalesReportDTO::getTotalCustomers)
                .sum());
        
        // Inventory data
        List<InventoryReportDTO> inventory = generateInventoryReport();
        summary.put("lowStockCount", inventory.stream()
                .filter(InventoryReportDTO::getIsLowStock)
                .count());
        summary.put("totalProducts", inventory.size());
        
        // Category data
        summary.put("topCategory", getCategoryAnalytics().stream().findFirst());
        
        return summary;
    }
}
