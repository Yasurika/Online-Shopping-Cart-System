package com.example.Shopping.Cart.controller;


import com.example.Shopping.Cart.dto.*;
import com.example.Shopping.Cart.model.Product;
import com.example.Shopping.Cart.model.User;
import com.example.Shopping.Cart.service.AdminService;
import com.example.Shopping.Cart.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ProductService productService;

    /**
     * Admin login
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginRequest request) {
        try {
            System.out.println("Admin login attempt: " + request.getUsername());
            User admin = adminService.adminLogin(request);
            System.out.println("Admin login successful: " + admin.getUsername());
            return ResponseEntity.ok(new ApiResponse(true, "Admin login successful", admin));
        } catch (Exception e) {
            System.err.println("Admin login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            DashboardStats stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get statistics"));
        }
    }

    /**
     * Get weekly popular products
     */
    @GetMapping("/analytics/popular")
    public ResponseEntity<?> getPopularProducts() {
        try {
            List<PopularProduct> products = adminService.getWeeklyPopularProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error getting popular products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get popular products"));
        }
    }

    /**
     * Get new products this week
     */
    @GetMapping("/analytics/new-products")
    public ResponseEntity<?> getNewProducts() {
        try {
            List<Product> products = adminService.getWeeklyNewProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error getting new products: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get new products"));
        }
    }

    /**
     * Create new product
     */
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            System.out.println("Creating new product: " + product.getName());
            Product created = productService.createProduct(product);
            return ResponseEntity.ok(new ApiResponse(true, "Product created successfully", created));
        } catch (Exception e) {
            System.err.println("Error creating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create product"));
        }
    }

    /**
     * Update product
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            System.out.println("Updating product ID: " + id);
            Product updated = productService.updateProduct(id, product);
            return ResponseEntity.ok(new ApiResponse(true, "Product updated successfully", updated));
        } catch (Exception e) {
            System.err.println("Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update product"));
        }
    }

    /**
     * Delete product
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("Deleting product ID: " + id);
            productService.deleteProduct(id);
            return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to delete product"));
        }
    }

    /**
     * Track product view
     */
    @PostMapping("/track-view/{productId}")
    public ResponseEntity<?> trackView(
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        try {
            adminService.trackProductView(productId, userId, ipAddress);
            return ResponseEntity.ok(new ApiResponse(true, "View tracked"));
        } catch (Exception e) {
            // Don't return error to client, just log it
            System.err.println("Error tracking view: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse(true, "View tracked"));
        }
    }
}
