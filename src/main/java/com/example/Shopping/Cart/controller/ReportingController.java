package com.example.Shopping.Cart.controller;

import com.example.Shopping.Cart.dto.ApiResponse;
import com.example.Shopping.Cart.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportingController {

    @Autowired
    private ReportingService reportingService;

    /**
     * Get sales report for date range
     */
    @GetMapping("/sales")
    public ResponseEntity<?> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) startDate = LocalDate.now().minusDays(30);
            if (endDate == null) endDate = LocalDate.now();
            
            return ResponseEntity.ok(reportingService.generateSalesReport(startDate, endDate));
        } catch (Exception e) {
            System.err.println("Error generating sales report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to generate sales report"));
        }
    }

    /**
     * Get inventory report
     */
    @GetMapping("/inventory")
    public ResponseEntity<?> getInventoryReport() {
        try {
            return ResponseEntity.ok(reportingService.generateInventoryReport());
        } catch (Exception e) {
            System.err.println("Error generating inventory report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to generate inventory report"));
        }
    }

    /**
     * Get low stock alerts
     */
    @GetMapping("/inventory/low-stock")
    public ResponseEntity<?> getLowStockAlerts() {
        try {
            return ResponseEntity.ok(reportingService.getLowStockAlerts());
        } catch (Exception e) {
            System.err.println("Error getting low stock alerts: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get low stock alerts"));
        }
    }

    /**
     * Get category analytics
     */
    @GetMapping("/analytics/category")
    public ResponseEntity<?> getCategoryAnalytics() {
        try {
            return ResponseEntity.ok(reportingService.getCategoryAnalytics());
        } catch (Exception e) {
            System.err.println("Error getting category analytics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get category analytics"));
        }
    }

    /**
     * Get dashboard summary
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<?> getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) startDate = LocalDate.now().minusDays(7);
            if (endDate == null) endDate = LocalDate.now();
            
            Map<String, Object> summary = reportingService.getDashboardSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            System.err.println("Error getting dashboard summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get dashboard summary"));
        }
    }
}
