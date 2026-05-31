<div align="center">
  <img src="assets/logo.svg" alt="RestaurantIQ Logo" width="180">

  <h1>RestaurantIQ</h1>
  <p><b>Enterprise-Grade Restaurant Inventory Management System</b></p>
  <p><em>Automated expiry tracking, dynamic cost calculations, and immutable audit trails.</em></p>

  <div>
    <img src="https://img.shields.io/badge/React-18-00d8ff?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
    <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.x" />
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8.0" />
    <br/>
    <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/Deployed_on-Railway-131415?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
  </div>
</div>

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| 🌐 **Live Application** | [RestaurantIQ Vercel App](https://restaurant-inventory-management-sys-six.vercel.app) |
| 🔌 **Backend API** | [Railway Production API](https://restaurant-inventory-management-system-production.up.railway.app/api/dashboard/summary) |
| 📂 **Repository** | [GitHub Source Code](https://github.com/BalakrishnaKini/restaurant-inventory-management-system) |
| 🎥 **Demo Video** | *(Video coming soon)* |

---

## 🎯 Executive Summary

**RestaurantIQ** bridges the gap between simple CRUD operations and real-world financial tracking. Designed to solve critical restaurant logistics, it eliminates manual stock errors, automates expiry warnings, and introduces dynamic **Weighted Average Costing (WAC)** to ensure completely accurate inventory valuation.

---

## ✨ Feature Matrix

| Category | Key Features | Capabilities |
|----------|-------------|--------------|
| 📊 **Analytics** | Dashboard & KPIs | Real-time valuation, low-stock alerts, out-of-stock monitoring, trend visualization. |
| 📦 **Inventory** | Core Management | Add/Edit/Delete items, granular unit tracking, active category filtering. |
| 🛒 **Procurement** | Purchase Orders | End-to-end PO lifecycle, automated stock increment upon receipt. |
| 💰 **Financials** | Dynamic WAC | Automatic recalculation of unit prices when receiving new stock at different price points. |
| ⏳ **Health** | Expiry Tracking | Automated timezone-aware categorization (Fresh, Expiring Soon, Expires Today, Expired). |
| 📜 **Auditing** | Immutable Logs | Comprehensive historical ledger tracking every addition, reduction, and manual adjustment. |

---

## 🏗️ System Architecture

RestaurantIQ utilizes a decoupled **DTO (Data Transfer Object)** architecture to ensure strict separation of concerns between database entities and client-facing REST APIs.

```mermaid
graph TD
    Client[Client-Side<br/><b>React & Vite SPA</b>]
    Controller[API Gateway<br/><b>Spring REST Controllers</b>]
    Mapper[DTO Mapping<br/><b>Service Layer & Mapper</b>]
    DB[(Relational DB<br/><b>MySQL 8.0</b>)]

    Client -- HTTP / JSON --> Controller
    Controller -- DTOs --> Mapper
    Mapper -- Entities / JPA --> DB
    
    classDef frontend fill:#00d8ff,stroke:#000,stroke-width:2px,color:#000;
    classDef backend fill:#6DB33F,stroke:#000,stroke-width:2px,color:#fff;
    classDef database fill:#4479A1,stroke:#000,stroke-width:2px,color:#fff;
    
    class Client frontend;
    class Controller,Mapper backend;
    class DB database;
```

---

## 📸 Visual Showcase

<table>
  <tr>
    <td width="50%">
      <b>1. Analytics Dashboard</b><br/>
      <img src="https://github.com/user-attachments/assets/586273a8-7c15-4f64-9249-7f5808702864" alt="Dashboard" />
    </td>
    <td width="50%">
      <b>2. Inventory Management</b><br/>
      <img src="https://github.com/user-attachments/assets/2687f7f1-bc80-41be-8540-9c688c5a2fa4" alt="Inventory Management" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>3. Purchase Orders Workflow</b><br/>
      <img src="https://github.com/user-attachments/assets/1e095b89-9b56-41d5-b81f-7bf6f91adbf5" alt="Purchase Orders" />
    </td>
    <td width="50%">
      <b>4. Immutable Audit History</b><br/>
      <img src="https://github.com/user-attachments/assets/de9d4ca7-d984-4a51-89e2-20dbf168bfa6" alt="Inventory History" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>5. Category Management</b><br/>
      <img src="https://github.com/user-attachments/assets/9f7ad821-d60a-4cd3-bc0c-a88b3f29cfe5" alt="Categories" />
    </td>
    <td width="50%">
      <b>6. Supplier Directory</b><br/>
      <img src="https://github.com/user-attachments/assets/5b2e1382-bc36-49ca-9850-2dd05c3d0224" alt="Suppliers" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>7. Exportable Reports</b><br/>
      <img src="https://github.com/user-attachments/assets/0a769dd6-3517-492f-bf29-fed6d59a74a7" alt="Reports" />
    </td>
    <td width="50%">
      <b>8. Authentication</b><br/>
      <img src="https://github.com/user-attachments/assets/d36b259a-71f2-40b8-839f-b358617f2a11" alt="Login" />
    </td>
  </tr>
</table>

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
|--------|-------------------|
| **Frontend** | React 18, Vite, React Router DOM, Recharts, Axios |
| **Backend** | Java 21, Spring Boot 3.x, Spring Data JPA, Hibernate |
| **Database** | MySQL 8.0 |
| **Deployment**| Vercel (Frontend edge network), Railway (Backend & DB) |

---

## ⚙️ Local Setup Instructions

### Prerequisites
* **Java 21**
* **Node.js 18+**
* **MySQL 8.0+**
* **Maven**

### 1. Database Initialization
Create a new local MySQL database:
```sql
CREATE DATABASE restaurant_inventory;
```

### 2. Backend Startup
Configure your local database credentials in `backend/src/main/resources/application.properties`, then run:
```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend Startup
In a separate terminal window, initialize the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Additional Documentation

* [**Backend API Documentation**](backend/README.md) - Deep dive into the Spring Boot architecture, WAC algorithm, and REST endpoints.

---

## 👨‍💻 Author

**Balakrishna Kini**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/balakrishna-kini)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Balakrishna-kini)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:balakrishnakini22@gmail.com)
