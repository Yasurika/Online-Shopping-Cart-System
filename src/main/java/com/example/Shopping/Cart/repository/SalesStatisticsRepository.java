package com.example.Shopping.Cart.repository;


import com.example.Shopping.Cart.model.SalesStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface SalesStatisticsRepository extends JpaRepository<SalesStatistics, Long> {
    Optional<SalesStatistics> findByProductId(Long productId);

    @Query("SELECT SUM(ss.totalRevenue) FROM SalesStatistics ss")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(ss.quantitySold) FROM SalesStatistics ss")
    Long getTotalSales();
}
