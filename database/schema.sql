-- ============================================
-- SHOPPING CART DATABASE - COMPLETE SETUP
-- ============================================

-- Drop database if exists (WARNING: This deletes all data!)
DROP DATABASE IF EXISTS shopping_cart;

-- Create database
CREATE DATABASE shopping_cart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopping_cart;

-- ============================================
-- TABLE STRUCTURES
-- ============================================

-- Users Table
CREATE TABLE users (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role VARCHAR(20) DEFAULT 'USER',
                       full_name VARCHAR(100),
                       phone VARCHAR(20),
                       address TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       INDEX idx_username (username),
                       INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE products (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(200) NOT NULL,
                          description TEXT,
                          price DECIMAL(10, 2) NOT NULL,
                          stock_quantity INT NOT NULL DEFAULT 0,
                          category VARCHAR(50) NOT NULL,
                          image_url VARCHAR(500),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          INDEX idx_category (category),
                          INDEX idx_price (price),
                          INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Table
CREATE TABLE cart (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      user_id BIGINT NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                      INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Items Table
CREATE TABLE cart_items (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            cart_id BIGINT NOT NULL,
                            product_id BIGINT NOT NULL,
                            quantity INT NOT NULL DEFAULT 1,
                            price DECIMAL(10, 2) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
                            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                            INDEX idx_cart_id (cart_id),
                            INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE orders (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        user_id BIGINT NOT NULL,
                        total_amount DECIMAL(10, 2) NOT NULL,
                        status VARCHAR(50) DEFAULT 'PENDING',
                        shipping_address TEXT,
                        payment_method VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        INDEX idx_user_id (user_id),
                        INDEX idx_status (status),
                        INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE order_items (
                             id BIGINT PRIMARY KEY AUTO_INCREMENT,
                             order_id BIGINT NOT NULL,
                             product_id BIGINT NOT NULL,
                             quantity INT NOT NULL,
                             price DECIMAL(10, 2) NOT NULL,
                             FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY (product_id) REFERENCES products(id),
                             INDEX idx_order_id (order_id),
                             INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE USERS
-- ============================================

INSERT INTO users (username, email, password, role, full_name, phone, address) VALUES
                                                                              ('admin', 'admin@shopeasy.com', 'admin123', 'ADMIN', 'System Administrator', '+1-555-0100', '123 Admin Street, Tech City, TC 12345'),
                                                                              ('john_doe', 'john.doe@example.com', 'user123', 'USER', 'John Doe', '+1-555-0101', '456 Oak Avenue, Springfield, SP 67890'),
                                                                              ('jane_smith', 'jane.smith@example.com', 'user123', 'USER', 'Jane Smith', '+1-555-0102', '789 Pine Road, Riverside, RS 54321'),
                                                                              ('mike_wilson', 'mike.wilson@example.com', 'user123', 'USER', 'Mike Wilson', '+1-555-0103', '321 Elm Street, Lakeside, LS 98765'),
                                                                              ('sarah_jones', 'sarah.jones@example.com', 'user123', 'USER', 'Sarah Jones', '+1-555-0104', '654 Maple Drive, Hilltown, HT 11223');

-- ============================================
-- CATEGORY 1: ELECTRONICS (15 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Wireless Headphones Pro', 'Premium noise-cancelling Bluetooth headphones with 30hr battery life and superior sound quality', 129.99, 50, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
                                                                                         ('Smart Watch Series 5', 'Fitness tracking smartwatch with heart rate monitor, GPS, and sleep tracking', 249.99, 35, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
                                                                                         ('4K Action Camera', 'Waterproof 4K action camera with image stabilization and wide-angle lens', 199.99, 28, 'Electronics', 'https://images.unsplash.com/photo-1606503153255-59d7c2d2d1dd?w=400'),
                                                                                         ('Wireless Earbuds Pro', 'True wireless earbuds with active noise cancellation and premium sound', 89.99, 75, 'Electronics', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'),
                                                                                         ('Bluetooth Speaker XL', 'Portable 360° wireless speaker with 20hr battery and deep bass', 79.99, 60, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'),
                                                                                         ('Gaming Keyboard RGB', 'Mechanical gaming keyboard with RGB backlight and programmable keys', 119.99, 45, 'Electronics', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400'),
                                                                                         ('Wireless Gaming Mouse', 'Ergonomic wireless gaming mouse with 16000 DPI and customizable buttons', 59.99, 80, 'Electronics', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
                                                                                         ('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and charging', 49.99, 100, 'Electronics', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400'),
                                                                                         ('Power Bank 20000mAh', 'Fast charging portable power bank with dual USB ports and LED display', 39.99, 120, 'Electronics', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'),
                                                                                         ('Webcam HD 1080p', 'Full HD webcam with auto-focus, built-in microphone, and tripod mount', 69.99, 55, 'Electronics', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400'),
                                                                                         ('Phone Stand Adjustable', 'Universal adjustable phone holder and stand for desk and bedside', 24.99, 150, 'Electronics', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'),
                                                                                         ('Tablet 10 inch', 'Android tablet with 64GB storage, stylus support, and long battery life', 299.99, 25, 'Electronics', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400'),
                                                                                         ('Smart LED Light Bulbs', 'WiFi-enabled color-changing LED bulbs (4-pack) with app control', 44.99, 90, 'Electronics', 'https://images.unsplash.com/photo-1558346648-9757f2fa4474?w=400'),
                                                                                         ('Portable SSD 1TB', 'Ultra-fast portable SSD with USB-C connector and shock resistance', 149.99, 40, 'Electronics', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400'),
                                                                                         ('Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices', 29.99, 110, 'Electronics', 'https://images.unsplash.com/photo-1591290619762-d2c9e0d8d8a5?w=400');

-- ============================================
-- CATEGORY 2: FASHION (12 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Premium Cotton T-Shirt', 'Soft organic cotton crew neck t-shirt available in multiple colors', 29.99, 200, 'Fashion', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
                                                                                         ('Women Summer Dress', 'Elegant floral print summer dress with adjustable straps', 59.99, 80, 'Fashion', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'),
                                                                                         ('Classic Denim Jacket', 'Vintage style denim jacket for men and women with premium finish', 79.99, 65, 'Fashion', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400'),
                                                                                         ('Leather Wallet RFID', 'Genuine leather bifold wallet with RFID protection and coin pocket', 44.99, 90, 'Fashion', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'),
                                                                                         ('Aviator Sunglasses', 'Classic aviator sunglasses with UV400 protection and polarized lens', 34.99, 110, 'Fashion', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'),
                                                                                         ('Canvas Sneakers', 'Comfortable unisex canvas sneakers for everyday casual wear', 49.99, 140, 'Fashion', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400'),
                                                                                         ('Merino Wool Scarf', 'Soft merino wool winter scarf in classic patterns', 39.99, 75, 'Fashion', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400'),
                                                                                         ('Baseball Cap', 'Adjustable cotton baseball cap with embroidered logo', 19.99, 180, 'Fashion', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'),
                                                                                         ('Genuine Leather Belt', 'Classic leather belt with reversible buckle', 34.99, 95, 'Fashion', 'https://images.unsplash.com/photo-1624222247344-550fb60583f2?w=400'),
                                                                                         ('Crossbody Leather Bag', 'Stylish leather crossbody bag for women with adjustable strap', 69.99, 60, 'Fashion', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'),
                                                                                         ('Designer Wristwatch', 'Elegant minimalist wristwatch with leather strap', 89.99, 45, 'Fashion', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'),
                                                                                         ('Winter Beanie Hat', 'Warm knitted beanie hat in multiple colors', 24.99, 130, 'Fashion', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400');

-- ============================================
-- CATEGORY 3: SPORTS (14 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Premium Yoga Mat', 'Non-slip eco-friendly yoga mat with carrying strap and alignment marks', 34.99, 100, 'Sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'),
                                                                                         ('Running Shoes Pro', 'Lightweight running shoes with cushioned sole and breathable mesh', 89.99, 85, 'Sports', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
                                                                                         ('Adjustable Dumbbell Set', 'Adjustable dumbbell set 20kg with anti-slip grip and storage case', 99.99, 45, 'Sports', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),
                                                                                         ('Resistance Bands Set', 'Set of 5 resistance bands for strength training with door anchor', 24.99, 130, 'Sports', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400'),
                                                                                         ('Insulated Water Bottle', 'Stainless steel insulated water bottle 750ml keeps drinks cold 24hrs', 29.99, 200, 'Sports', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'),
                                                                                         ('Speed Jump Rope', 'Adjustable speed jump rope for cardio workout with counter', 14.99, 150, 'Sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'),
                                                                                         ('Large Gym Duffel Bag', 'Spacious gym duffel bag with shoe compartment and water bottle holder', 44.99, 70, 'Sports', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
                                                                                         ('Fitness Tracker Watch', 'Activity tracker with step counter, sleep monitor, and heart rate', 59.99, 90, 'Sports', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400'),
                                                                                         ('High Density Foam Roller', 'High-density foam roller for muscle recovery and deep tissue massage', 29.99, 80, 'Sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'),
                                                                                         ('Compression Socks', 'Graduated compression socks for running and recovery (3 pairs)', 19.99, 160, 'Sports', 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=400'),
                                                                                         ('Exercise Ball 65cm', 'Anti-burst exercise ball with pump included for yoga and pilates', 24.99, 95, 'Sports', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'),
                                                                                         ('Padded Cycling Gloves', 'Padded cycling gloves with breathable mesh and reflective strips', 22.99, 110, 'Sports', 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400'),
                                                                                         ('Sports Headband', 'Sweat-wicking sports headband (3-pack) for running and workouts', 12.99, 170, 'Sports', 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=400'),
                                                                                         ('Yoga Block Set', 'High-density foam yoga blocks (2-pack) with strap', 19.99, 120, 'Sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400');

-- ============================================
-- CATEGORY 4: HOME (16 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Automatic Coffee Maker', 'Programmable coffee maker with thermal carafe and auto shut-off', 89.99, 55, 'Home', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'),
                                                                                         ('LED Desk Lamp', 'Adjustable LED desk lamp with USB charging port and touch control', 39.99, 120, 'Home', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'),
                                                                                         ('HEPA Air Purifier', 'True HEPA air purifier for large rooms with quiet operation', 149.99, 40, 'Home', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'),
                                                                                         ('High Speed Blender', '1200W high-speed blender with 6 blades and multiple speed settings', 79.99, 65, 'Home', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400'),
                                                                                         ('Non-stick Cookware Set', 'Non-stick cookware set 12-piece with glass lids and soft-grip handles', 129.99, 35, 'Home', 'https://images.unsplash.com/photo-1584990347449-e72a8f832189?w=400'),
                                                                                         ('Electric Kettle 1.7L', 'Stainless steel electric kettle with auto shut-off and boil-dry protection', 34.99, 90, 'Home', 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400'),
                                                                                         ('Professional Knife Set', '15-piece kitchen knife set with wooden block and sharpening steel', 99.99, 50, 'Home', 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400'),
                                                                                         ('Bamboo Cutting Board', 'Large bamboo cutting board with juice groove and non-slip feet', 29.99, 140, 'Home', 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400'),
                                                                                         ('Stainless Dish Rack', 'Large capacity stainless steel dish drying rack with drainboard', 39.99, 75, 'Home', 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=400'),
                                                                                         ('Robot Vacuum Cleaner', 'Smart robot vacuum with app control and auto-charging', 299.99, 25, 'Home', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400'),
                                                                                         ('Microfiber Bed Sheets', 'Soft microfiber bed sheet set queen size with deep pockets', 44.99, 100, 'Home', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'),
                                                                                         ('Decorative Throw Pillows', 'Decorative throw pillows 18x18 inch set of 4 with inserts', 34.99, 85, 'Home', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400'),
                                                                                         ('Modern Wall Clock', 'Silent non-ticking wall clock 12 inch with modern design', 24.99, 110, 'Home', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400'),
                                                                                         ('Woven Storage Baskets', 'Woven storage basket organizer set of 3 with handles', 39.99, 95, 'Home', 'https://images.unsplash.com/photo-1564974368725-c2e9e9e16b70?w=400'),
                                                                                         ('Aromatherapy Diffuser', 'Ultrasonic aromatherapy essential oil diffuser with LED lights', 34.99, 105, 'Home', 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=400'),
                                                                                         ('Memory Foam Pillow', 'Memory foam pillow with cooling gel and bamboo cover', 49.99, 80, 'Home', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400');

-- ============================================
-- CATEGORY 5: BOOKS (8 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Fiction Bestseller 2024', 'Latest bestselling fiction novel with gripping storyline', 19.99, 150, 'Books', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
                                                                                         ('Complete Programming Guide', 'Comprehensive programming tutorial book for beginners to advanced', 49.99, 80, 'Books', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'),
                                                                                         ('Healthy Cooking Cookbook', 'Healthy cooking recipes for beginners with nutritional information', 29.99, 100, 'Books', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400'),
                                                                                         ('Self-Help & Motivation', 'Personal development and motivation guide to achieve your goals', 24.99, 120, 'Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
                                                                                         ('Children Story Collection', 'Illustrated storybook collection for kids ages 4-8', 14.99, 140, 'Books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
                                                                                         ('Photography Masterclass', 'Complete guide to digital photography from basics to professional', 39.99, 65, 'Books', 'https://images.unsplash.com/photo-1510172951991-856a654063f9?w=400'),
                                                                                         ('Business Strategy Book', 'Modern business strategy and management principles', 34.99, 75, 'Books', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400'),
                                                                                         ('Mindfulness & Meditation', 'Guide to mindfulness and meditation for daily practice', 22.99, 95, 'Books', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400');

-- ============================================
-- CATEGORY 6: BEAUTY (10 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Premium Skincare Set', 'Complete skincare routine set with cleanser, toner, and moisturizer', 79.99, 70, 'Beauty', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'),
                                                                                         ('Professional Hair Dryer', 'Ionic hair dryer with diffuser attachment and cool shot button', 59.99, 85, 'Beauty', 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400'),
                                                                                         ('Makeup Brush Set 15pc', 'Professional makeup brush set 15 pieces with carrying case', 44.99, 95, 'Beauty', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'),
                                                                                         ('Electric Shaver Men', 'Rechargeable electric shaver with 3 rotary heads and LED display', 69.99, 60, 'Beauty', 'https://images.unsplash.com/photo-1564029165254-1ee626d65c5c?w=400'),
                                                                                         ('Manicure & Pedicure Kit', 'Complete manicure and pedicure kit with carrying case', 34.99, 110, 'Beauty', 'https://images.unsplash.com/photo-1610992015762-45dca7464397?w=400'),
                                                                                         ('Luxury Perfume Women', 'Long-lasting luxury perfume for women 100ml', 89.99, 55, 'Beauty', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'),
                                                                                         ('Sonic Cleansing Brush', 'Waterproof sonic facial cleansing brush with 3 speed settings', 39.99, 75, 'Beauty', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'),
                                                                                         ('Anti-Aging Serum', 'Premium anti-aging serum with vitamin C and hyaluronic acid', 54.99, 90, 'Beauty', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'),
                                                                                         ('Hair Straightener Brush', 'Ionic hair straightener brush with adjustable temperature', 44.99, 80, 'Beauty', 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400'),
                                                                                         ('Natural Face Masks Set', 'Natural face masks variety pack (12 sheets) for all skin types', 29.99, 115, 'Beauty', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400');

-- ============================================
-- CATEGORY 7: TOYS (9 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Building Blocks 1000pc', 'Creative building blocks compatible with major brands', 49.99, 90, 'Toys', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'),
                                                                                         ('Strategy Board Game', 'Classic strategy board game for family fun ages 8+', 34.99, 80, 'Toys', 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400'),
                                                                                         ('RC Racing Car', 'Remote control racing car with rechargeable battery', 59.99, 65, 'Toys', 'https://images.unsplash.com/photo-1558418292-c2c5e5a93de8?w=400'),
                                                                                         ('Jigsaw Puzzle 1000pc', 'Beautiful landscape jigsaw puzzle 1000 pieces', 24.99, 100, 'Toys', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'),
                                                                                         ('Premium Action Figure', 'Premium collectible action figure with accessories', 39.99, 70, 'Toys', 'https://images.unsplash.com/photo-1581829103795-c18e51937774?w=400'),
                                                                                         ('Educational STEM Kit', 'Science experiment kit for kids ages 8+ with 50+ experiments', 44.99, 85, 'Toys', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'),
                                                                                         ('Plush Teddy Bear', 'Soft and cuddly teddy bear 18 inch perfect gift', 29.99, 120, 'Toys', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'),
                                                                                         ('Art & Craft Set', 'Complete art and craft set with paints, brushes, and canvas', 34.99, 95, 'Toys', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'),
                                                                                         ('Electronic Learning Tablet', 'Kids learning tablet with educational games and apps', 79.99, 55, 'Toys', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400');

-- ============================================
-- CATEGORY 8: OFFICE (11 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Business Laptop Backpack', 'Professional laptop backpack with USB charging port and multiple compartments', 54.99, 100, 'Office', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
                                                                                         ('Premium Notebook Set', 'Hardcover notebook set with ruled pages 3-pack for professionals', 24.99, 150, 'Office', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400'),
                                                                                         ('Executive Pen Set', 'Executive pen set with gift box and premium finish', 39.99, 80, 'Office', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400'),
                                                                                         ('Wooden Desk Organizer', 'Wooden desk organizer with multiple compartments for office supplies', 34.99, 90, 'Office', 'https://images.unsplash.com/photo-1588239034647-25783cbfcfc1?w=400'),
                                                                                         ('Magnetic Whiteboard', 'Magnetic dry erase whiteboard 24x36 with marker tray and mounting kit', 44.99, 60, 'Office', 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400'),
                                                                                         ('Portable Label Maker', 'Handheld label maker with LCD display and rechargeable battery', 29.99, 70, 'Office', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400'),
                                                                                         ('Cross-cut Shredder', 'Cross-cut paper shredder for home office with 6-sheet capacity', 69.99, 45, 'Office', 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=400'),
                                                                                         ('Heavy Duty Stapler', 'Metal heavy duty stapler 100-sheet capacity with staple remover', 19.99, 120, 'Office', 'https://images.unsplash.com/photo-1564936281403-11fcb70b4d68?w=400'),
                                                                                         ('Ergonomic Mouse Pad', 'Ergonomic mouse pad with wrist rest and non-slip base', 16.99, 140, 'Office', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
                                                                                         ('Document Organizer', 'Desktop document organizer with 5 tiers and mesh design', 27.99, 85, 'Office', 'https://images.unsplash.com/photo-1588239034647-25783cbfcfc1?w=400'),
                                                                                         ('Sticky Notes Set', 'Colorful sticky notes set with multiple sizes (12 pads)', 14.99, 160, 'Office', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400');

-- ============================================
-- CATEGORY 9: AUTOMOTIVE (8 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Universal Car Phone Mount', 'Universal car phone holder for dashboard with 360° rotation', 19.99, 180, 'Automotive', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
                                                                                         ('Portable Car Vacuum', 'Portable handheld car vacuum with attachments and LED light', 39.99, 95, 'Automotive', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400'),
                                                                                         ('Digital Tire Gauge', 'Digital tire pressure gauge with LED display and auto shut-off', 14.99, 140, 'Automotive', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'),
                                                                                         ('Complete Tool Set 150pc', 'Complete home tool kit with carrying case and lifetime warranty', 99.99, 50, 'Automotive', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'),
                                                                                         ('Cordless Drill Kit 20V', '20V cordless drill with battery, charger, and carrying case', 89.99, 55, 'Automotive', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'),
                                                                                         ('Rechargeable LED Work Light', 'Rechargeable LED work light with magnetic base and hook', 29.99, 100, 'Automotive', 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400'),
                                                                                         ('Car Air Freshener Set', 'Premium car air freshener set with multiple scents (6-pack)', 12.99, 200, 'Automotive', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
                                                                                         ('Jump Starter Power Bank', 'Portable jump starter and power bank 20000mAh with flashlight', 79.99, 60, 'Automotive', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400');

-- ============================================
-- CATEGORY 10: PETS (10 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Premium Dog Food 15kg', 'High-quality dry dog food for adult dogs with real meat', 54.99, 70, 'Pets', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'),
                                                                                         ('Automatic Cat Litter Box', 'Self-cleaning automatic cat litter box with odor control', 149.99, 30, 'Pets', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400'),
                                                                                         ('Pet Carrier Backpack', 'Comfortable pet carrier backpack for cats and small dogs', 44.99, 60, 'Pets', 'https://images.unsplash.com/photo-1607580420948-62a555ad6923?w=400'),
                                                                                         ('Retractable Dog Leash', 'Retractable dog leash 5m with brake button and ergonomic handle', 24.99, 110, 'Pets', 'https://images.unsplash.com/photo-1600077106724-946750eeaf3c?w=400'),
                                                                                         ('Tall Cat Scratching Post', 'Tall cat scratching post with perch and hanging toys', 39.99, 75, 'Pets', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400'),
                                                                                         ('Automatic Pet Fountain', 'Automatic pet water fountain 2L with filter and quiet pump', 34.99, 85, 'Pets', 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400'),
                                                                                         ('Orthopedic Dog Bed', 'Memory foam orthopedic dog bed large size with washable cover', 69.99, 50, 'Pets', 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=400'),
                                                                                         ('Interactive Cat Toy', 'Interactive electronic cat toy with feathers and LED lights', 29.99, 95, 'Pets', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400'),
                                                                                         ('Pet Grooming Kit', 'Complete pet grooming kit with clippers, scissors, and brushes', 49.99, 65, 'Pets', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'),
                                                                                         ('Collapsible Pet Bowl', 'Collapsible silicone pet bowl set for food and water (2-pack)', 16.99, 120, 'Pets', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400');

-- ============================================
-- CATEGORY 11: GARDEN (10 Products)
-- ============================================

INSERT INTO products (name, description, price, stock_quantity, category, image_url) VALUES
                                                                                         ('Garden Tool Set 10pc', 'Essential garden tools with ergonomic handles and carrying bag', 49.99, 65, 'Garden', 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400'),
                                                                                         ('Family Camping Tent', 'Waterproof family camping tent 4-person with rain fly', 129.99, 40, 'Garden', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400'),
                                                                                         ('Portable BBQ Grill', 'Foldable charcoal BBQ grill for outdoor cooking and camping', 79.99, 55, 'Garden', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'),
                                                                                         ('Solar Pathway Lights', 'Solar powered pathway lights set of 8 with auto on/off', 34.99, 90, 'Garden', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400'),
                                                                                         ('Hammock with Stand', 'Portable hammock with steel stand and carrying bag', 99.99, 45, 'Garden', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'),
                                                                                         ('Ceramic Plant Pots Set', 'Decorative ceramic plant pots set of 6 with drainage holes', 39.99, 80, 'Garden', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'),
                                                                                         ('Expandable Garden Hose', 'Expandable garden hose 50ft with spray nozzle and storage bag', 29.99, 100, 'Garden', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
                                                                                         ('Patio Umbrella 9ft', 'UV protection patio umbrella with tilt function and crank handle', 89.99, 50, 'Garden', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400'),
                                                                                         ('Raised Garden Bed', 'Elevated raised garden bed with legs and drainage system', 74.99, 35, 'Garden', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400'),
                                                                                         ('Garden Kneeler Seat', 'Foldable garden kneeler and seat with tool pouches', 44.99, 70, 'Garden', 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400');

-- ============================================
-- SUMMARY STATISTICS
-- ============================================

-- Display category counts
SELECT
    category,
    COUNT(*) as product_count,
    CONCAT('$', FORMAT(MIN(price), 2)) as min_price,
    CONCAT('$', FORMAT(MAX(price), 2)) as max_price,
    CONCAT('$', FORMAT(AVG(price), 2)) as avg_price,
    SUM(stock_quantity) as total_stock
FROM products
GROUP BY category
ORDER BY category;

-- Display total statistics
SELECT
    COUNT(*) as total_products,
    COUNT(DISTINCT category) as total_categories,
    CONCAT('$', FORMAT(MIN(price), 2)) as lowest_price,
    CONCAT('$', FORMAT(MAX(price), 2)) as highest_price,
    CONCAT('$', FORMAT(AVG(price), 2)) as average_price,
    SUM(stock_quantity) as total_items_in_stock
FROM products;

-- Display user count
SELECT COUNT(*) as total_users FROM users;

-- ============================================
-- DATABASE SETUP COMPLETE
-- ============================================

SELECT '✓ Database created successfully!' as status;
SELECT '✓ All tables created!' as status;
SELECT '✓ Sample users added!' as status;
SELECT '✓ All 11 categories populated with products!' as status;
SELECT '' as '';
SELECT 'You can now start your Spring Boot application!' as message;
SELECT 'Login credentials:' as '';
SELECT '  Username: admin, Password: admin123' as admin_account;
SELECT '  Username: john_doe, Password: user123' as user_account;