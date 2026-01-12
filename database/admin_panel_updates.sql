USE shopping_cart;

-- ============================================
-- ADD ROLES TO USERS
-- ============================================

ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER' AFTER password;

-- Update existing admin user
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

-- Add index for role
CREATE INDEX idx_role ON users(role);

-- ============================================
-- CREATE PRODUCT VIEWS TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS product_views (
                                             id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                             product_id BIGINT NOT NULL,
                                             user_id BIGINT,
                                             ip_address VARCHAR(45),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_viewed_at (viewed_at),
    INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CREATE SALES STATISTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sales_statistics (
                                                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                product_id BIGINT NOT NULL,
                                                quantity_sold INT DEFAULT 0,
                                                total_revenue DECIMAL(12, 2) DEFAULT 0.00,
    last_sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_quantity_sold (quantity_sold DESC),
    INDEX idx_total_revenue (total_revenue DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CREATE WEEKLY STATISTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW weekly_popular_products AS
SELECT
    p.id,
    p.name,
    p.price,
    p.category,
    p.image_url,
    COUNT(pv.id) as view_count,
    COALESCE(ss.quantity_sold, 0) as sales_count,
    COALESCE(ss.total_revenue, 0) as revenue
FROM products p
         LEFT JOIN product_views pv ON p.id = pv.product_id
    AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         LEFT JOIN sales_statistics ss ON p.id = ss.product_id
GROUP BY p.id, p.name, p.price, p.category, p.image_url, ss.quantity_sold, ss.total_revenue
ORDER BY view_count DESC, sales_count DESC
    LIMIT 10;

-- ============================================
-- CREATE NEW PRODUCTS THIS WEEK VIEW
-- ============================================

CREATE OR REPLACE VIEW weekly_new_products AS
SELECT
    id,
    name,
    description,
    price,
    stock_quantity,
    category,
    image_url,
    created_at
FROM products
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;

-- ============================================
-- INSERT SAMPLE DATA FOR STATISTICS
-- ============================================

-- Initialize sales statistics for existing products
INSERT INTO sales_statistics (product_id, quantity_sold, total_revenue)
SELECT
    id,
    FLOOR(RAND() * 100) as quantity_sold,
    FLOOR(RAND() * 100) * price as total_revenue
FROM products
    ON DUPLICATE KEY UPDATE product_id=product_id;

-- Create sample product views
INSERT INTO product_views (product_id, user_id, viewed_at)
SELECT
    p.id,
    FLOOR(1 + RAND() * 5) as user_id,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 7) DAY) as viewed_at
FROM products p
         CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) numbers
    LIMIT 200;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT 'Admin role added to users table' as status;
SELECT COUNT(*) as admin_count FROM users WHERE role = 'ADMIN';

SELECT 'Product views table created' as status;
SELECT COUNT(*) as total_views FROM product_views;

SELECT 'Sales statistics initialized' as status;
SELECT COUNT(*) as products_tracked FROM sales_statistics;

SELECT 'Weekly popular products view ready' as status;
SELECT * FROM weekly_popular_products LIMIT 5;