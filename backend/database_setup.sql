-- ============================================
-- Restaurant Inventory Management System
-- MySQL Database Setup Script
-- ============================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS restaurant_inventory;

-- Step 2: Use the database
USE restaurant_inventory;

-- ============================================
-- The tables below are AUTO-CREATED by Spring Boot (JPA)
-- when you run the application.
-- But you can also run this to verify structure.
-- ============================================

-- Step 3 (Optional): Insert sample data for testing

-- Sample Categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Vegetables', 'Fresh vegetables and greens', NOW(), NOW()),
('Meat & Poultry', 'Chicken, beef, mutton and other meats', NOW(), NOW()),
('Dairy Products', 'Milk, cheese, butter and dairy items', NOW(), NOW()),
('Beverages', 'Soft drinks, juices and water', NOW(), NOW()),
('Spices & Condiments', 'Salt, pepper, sauces and spices', NOW(), NOW()),
('Grains & Cereals', 'Rice, wheat, flour and grains', NOW(), NOW());

-- Sample Suppliers
INSERT INTO suppliers (name, email, phone, address, contact_person, created_at, updated_at) VALUES
('Fresh Farm Suppliers', 'contact@freshfarm.com', '9876543210', '12 Market Road, Bangalore', 'Ravi Kumar', NOW(), NOW()),
('City Meat House', 'orders@citymeat.com', '9876543211', '45 Butcher Lane, Bangalore', 'Suresh Patel', NOW(), NOW()),
('Daily Dairy Co.', 'supply@dailydairy.com', '9876543212', '78 Dairy Colony, Bangalore', 'Priya Sharma', NOW(), NOW()),
('Spice World', 'info@spiceworld.com', '9876543213', '23 Spice Market, Bangalore', 'Anita Rao', NOW(), NOW());

-- Sample Inventory Items
INSERT INTO inventory_items (name, description, unit, quantity_in_stock, reorder_level, unit_price, category_id, supplier_id, created_at, updated_at) VALUES
('Tomatoes', 'Fresh red tomatoes', 'kg', 50.0, 10.0, 30.00, 1, 1, NOW(), NOW()),
('Onions', 'White onions', 'kg', 80.0, 15.0, 20.00, 1, 1, NOW(), NOW()),
('Chicken Breast', 'Boneless chicken breast', 'kg', 30.0, 10.0, 250.00, 2, 2, NOW(), NOW()),
('Whole Milk', 'Full cream pasteurized milk', 'liters', 40.0, 10.0, 55.00, 3, 3, NOW(), NOW()),
('Basmati Rice', 'Premium basmati rice', 'kg', 100.0, 25.0, 80.00, 6, 1, NOW(), NOW()),
('Black Pepper', 'Ground black pepper', 'kg', 5.0, 2.0, 400.00, 5, 4, NOW(), NOW()),
('Butter', 'Unsalted butter', 'kg', 8.0, 3.0, 450.00, 3, 3, NOW(), NOW()),
('Ginger', 'Fresh ginger root', 'kg', 3.0, 1.0, 60.00, 5, 1, NOW(), NOW());

-- Verify data loaded
SELECT 'Categories' as 'Table', COUNT(*) as 'Records' FROM categories
UNION ALL
SELECT 'Suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'Inventory Items', COUNT(*) FROM inventory_items;
