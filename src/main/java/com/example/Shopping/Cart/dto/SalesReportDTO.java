package com.example.Shopping.Cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportDTO {
    private LocalDate date;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long totalCustomers;
    private BigDecimal averageOrderValue;
}
