package com.example.Shopping.Cart.service;


import com.example.Shopping.Cart.dto.AdminLoginRequest;
import com.example.Shopping.Cart.dto.DashboardStats;
import com.example.Shopping.Cart.dto.PopularProduct;
import com.example.Shopping.Cart.model.*;
import com.example.Shopping.Cart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductViewRepository productViewRepository;

    @Autowired
    private SalesStatisticsRepository salesStatisticsRepository;

    /**
     * Admin login
     */
    public User adminLogin(AdminLoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access denied. Admin privileges required.");
        }

        return user;
    }

    /**
     * Get dashboard statistics
     */
    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();

        // Total products
        stats.setTotalProducts(productRepository.count());

        // Total users
        stats.setTotalUsers(userRepository.count());

        // Total orders
        stats.setTotalOrders(orderRepository.count());

        // Today's orders
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        stats.setTodayOrders(orderRepository.countByCreatedAtAfter(startOfDay));

        // Total revenue
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // Today's revenue
        BigDecimal todayRevenue = orderRepository.getTotalRevenueToday(startOfDay);
        stats.setTodayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO);

        // Low stock products (less than 20)
        stats.setLowStockProducts(productRepository.countByStockQuantityLessThan(20));

        // Out of stock products
        stats.setOutOfStockProducts(productRepository.countByStockQuantity(0));

        return stats;
    }

    /**
     * Get weekly popular products
     */
    public List<PopularProduct> getWeeklyPopularProducts() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        return productRepository.findAll().stream()
                .map(product -> {
                    PopularProduct popular = new PopularProduct();
                    popular.setId(product.getId());
                    popular.setName(product.getName());
                    popular.setPrice(product.getPrice());
                    popular.setCategory(product.getCategory());
                    popular.setImageUrl(product.getImageUrl());

                    // Count views
                    Long viewCount = (long) productViewRepository
                            .findByProductIdAndViewedAtAfter(product.getId(), weekAgo)
                            .size();
                    popular.setViewCount(viewCount);

                    // Get sales statistics
                    SalesStatistics stats = salesStatisticsRepository
                            .findByProductId(product.getId())
                            .orElse(null);

                    if (stats != null) {
                        popular.setSalesCount(stats.getQuantitySold().longValue());
                        popular.setRevenue(stats.getTotalRevenue());
                    } else {
                        popular.setSalesCount(0L);
                        popular.setRevenue(BigDecimal.ZERO);
                    }

                    return popular;
                })
                .sorted((a, b) -> Long.compare(b.getViewCount(), a.getViewCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Get new products this week
     */
    public List<Product> getWeeklyNewProducts() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        return productRepository.findByCreatedAtAfter(weekAgo);
    }

    /**
     * Track product view
     */
    public void trackProductView(Long productId, Long userId, String ipAddress) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ProductView view = new ProductView();
        view.setProduct(product);

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            view.setUser(user);
        }

        view.setIpAddress(ipAddress);
        productViewRepository.save(view);
    }
}
