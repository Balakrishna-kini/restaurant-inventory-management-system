<p align="center">
  <img src="../assets/logo.svg" alt="RestaurantIQ Logo" width="180">
</p>

<h1 align="center">RestaurantIQ</h1>

<p align="center">
  Smart Restaurant Inventory Management System
</p>

<p align="center">
  React • Spring Boot • MySQL
</p>

<p align="center">
  <em>Modern inventory intelligence platform designed for restaurants to manage stock, suppliers, purchase orders, expiry tracking, and business analytics.</em>
</p>

---

## 🚀 Project Status & Tech

![React](https://img.shields.io/badge/React-18-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![Vite](https://img.shields.io/badge/Vite-latest-purple)
![Status](https://img.shields.io/badge/Status-Completed-success)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🎥 Demo Video

Watch the complete RestaurantIQ walkthrough:

[Demo Video](#) *(Video coming soon)*

---

## 🌐 Live Demo

**Frontend:** [http://localhost:5173](http://localhost:5173)  
**Backend API:** [http://localhost:8080/api/dashboard/summary](http://localhost:8080/api/dashboard/summary)  
**Repository:** [https://github.com/BalakrishnaKini/restaurant-inventory-management-system](https://github.com/BalakrishnaKini/restaurant-inventory-management-system)

---

## 🎯 Project Overview

### Problem Statement
Restaurants often struggle with:
* Manual, error-prone inventory tracking
* Expensive stock wastage due to poor visibility
* Serving expired products
* Disorganized supplier coordination
* Inaccurate financial inventory valuation

### The Solution
RestaurantIQ provides a centralized, automated platform featuring:
* Inventory Management
* Purchase Order Management
* Supplier Management
* Automated Expiry Tracking
* Real-time Analytics & Reporting
* Immutable Inventory Audit Trails

---

## ✨ Key Features

### 📊 Dashboard Analytics
* Real-time KPIs
* Business Insights & Trend Mapping
* Instant Inventory Valuation
* Low Stock & Out of Stock Monitoring

### 📦 Inventory Management
* Add, Edit, and Delete Inventory Items
* Manage Categories & Suppliers
* Granular Units Management
* Stock Level Tracking & Manual Adjustments

### 🛒 Purchase Orders
* Create Custom Purchase Orders
* Receive and Fulfill Orders
* Auto-Inventory Updates on Receipt
* **Dynamic Weighted Average Cost Calculation**

### ⏳ Expiry Tracking
* Automated Timezone-aware categorization:
  * Expired (Past due date)
  * Expires Today (Immediate action)
  * Expiring Soon (1-7 days notice)
* Real-time Expiry Notifications

### 📈 Reports & Analytics
* Comprehensive Inventory Reports
* Stock Movement Reports
* Category Profitability Analytics
* One-click CSV Export

### 📜 Audit & History
* Global Inventory History Logs
* Detailed Stock Update Logs (Added, Reduced, Adjusted)
* Purchase Order History Tracking

### ⚡ Productivity Features
* Intelligent Pagination
* Sortable Data Tables
* Global Search
* Advanced Filtering

---

## 📸 Screenshots

### Login Page
![Login](../screenshots/login.png)

### Dashboard
![Dashboard](../screenshots/dashboard.png)

### Inventory Management
![Inventory](../screenshots/inventory.png)

### Categories
![Categories](../screenshots/categories.png)

### Suppliers
![Suppliers](../screenshots/suppliers.png)

### Purchase Orders
![Purchase Orders](../screenshots/purchase-orders.png)

### Reports
![Reports](../screenshots/reports.png)

### Inventory History
![History](../screenshots/history.png)

---

## 🏗️ Architecture

```text
React Frontend (Vite SPA)
      ↓ REST APIs (DTO Layer)
Spring Boot Backend Service
      ↓ JPA / Hibernate
MySQL Relational Database
```

### Frontend
* **React 18** (UI rendering)
* **Vite** (Build tool)
* **Context API** (State management)
* **Custom Hooks** (`useTable` for sorting/pagination)
* **Recharts** (Data visualization)

### Backend
* **Spring Boot 3.x** (MVC Framework)
* **Service Layer** (Business logic isolation)
* **DTO Layer** (Decoupled data transfer via `DTOMapper`)
* **REST APIs** (Standardized JSON endpoints)

### Database
* **MySQL** (Relational persistence)
* **JPA/Hibernate** (ORM Mapping)
* **Audit Trails** (Triggered history logs)
* **Soft Deletes** (Data preservation flags)

---

## 🧠 Business Logic Highlights

### Weighted Average Cost (WAC)
To maintain accurate inventory valuation, RestaurantIQ dynamically recalculates the unit price whenever new stock is received via a Purchase Order:
> **New Cost** = `((Current Quantity × Current Cost) + (New Quantity × Purchase Cost)) / (Total Quantity)`

### Expiry Tracking
The system automatically categorizes inventory health based on precise date mathematics:
* **Expired:** `< 0 days`
* **Expires Today:** `0 days`
* **Expiring Soon:** `1-7 days`
* **Fresh:** `> 7 days`

### Inventory Audit Trail
Every single inventory action is intercepted and automatically generates immutable `StockHistory` records:
* Item Created
* Item Updated
* Stock Added
* Stock Reduced
* Purchase Order Received

### Dashboard Summary API
To optimize performance, complex KPI processing is offloaded to the backend via `/api/dashboard/summary`, returning aggregated:
* Total Inventory Value
* Low Stock / Out Of Stock Counts
* Expiry Statistics

---

## 🛠️ Tech Stack

### Frontend
* React 18
* Vite
* React Router DOM
* Recharts
* React Icons

### Backend
* Java 17
* Spring Boot 3.x
* Spring Data JPA
* Hibernate

### Database
* MySQL

### Testing
* JUnit 5
* Mockito

---

## 🔌 API Overview

### Dashboard
* `GET /api/dashboard/summary` - Aggregated KPI metrics

### Inventory
* `GET /api/inventory` - Fetch mapped InventoryItem DTOs
* `POST /api/inventory` - Create an item
* `PATCH /api/inventory/{id}/stock` - Manually adjust stock
* `PATCH /api/inventory/{id}/reduce-stock` - Log kitchen usage

### Categories
* `GET /api/categories` - Fetch all active categories

### Suppliers
* `GET /api/suppliers` - Fetch all active suppliers

### Purchase Orders
* `GET /api/purchase-orders` - Fetch PO lifecycle
* `PATCH /api/purchase-orders/{id}/status` - Update status (Triggers WAC!)

### History
* `GET /api/stock-history` - Fetch global audit logs

---

## ⚙️ Setup Instructions

### Prerequisites
* Java 17
* Node.js 18+
* MySQL 8.0+
* Maven

### Backend Setup
1. Create a MySQL database named `restaurant_inventory`.
2. Configure `backend/src/main/resources/application.properties` with your database credentials.
3. Open a terminal in the `/backend` folder and run: 
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Open a terminal in the `/frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🔮 Future Enhancements

* **Server-Side Pagination:** Utilizing Spring Data `Pageable` for massive dataset streaming.
* **JWT Authentication:** Stateful token-based session verification.
* **Role-Based Access Control:** Separate permissions for Admins, Managers, and Staff.
* **Docker Deployment:** Containerizing the stack for cloud deployment.
* **CI/CD Pipeline:** Automated GitHub Actions for JUnit testing.
* **Forecasting Analytics:** ML integration to predict stock depletion.

---

## 🏆 Why This Project Stands Out

### Highlights
* **Weighted Average Costing**
* **Purchase Order Workflow**
* **Inventory Audit Trails**
* **Automated Expiry Tracking**
* **Real-time Notifications**
* **Dashboard Analytics**
* **Decoupled DTO Architecture**
* **Soft Delete Support**
* **Professional UI/UX**
* **Full-Stack Component Architecture**

Unlike traditional student CRUD applications, RestaurantIQ implements **real-world restaurant business processes**. It bridges the gap between simple database operations and complex financial tracking by maintaining an immutable audit history, automatically recalculating asset valuations (WAC), and aggressively prioritizing a polished, enterprise-ready user experience.

---

## 👨‍💻 Author

**Balakrishna Kini**

* **LinkedIn:** [Your LinkedIn URL]
* **GitHub:** [Your GitHub Profile URL]
* **Email:** [Your Email Address]
