<div align="center">
  <img src="../assets/logo.svg" alt="RestaurantIQ Logo" width="180">

  <h1>RestaurantIQ Backend Service</h1>
  <p><b>Spring Boot 3.x REST API Layer</b></p>

  <div>
    <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.x" />
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8.0" />
    <br/>
    <img src="https://img.shields.io/badge/Deployed_on-Railway-131415?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
  </div>
</div>

---

## 🔗 Live Production API
**Endpoint:** [https://restaurant-inventory-management-system-production.up.railway.app/api/dashboard/summary](https://restaurant-inventory-management-system-production.up.railway.app/api/dashboard/summary)

---

## 🎯 Architecture Overview

This backend is the engine powering RestaurantIQ. It handles database persistence, dynamic valuation algorithms, and enforces strict data integrity via a decoupled DTO layer.

```mermaid
graph TD
    Controller["REST Controllers<br/><b>JSON Endpoints</b>"]
    Service["Service Layer<br/><b>Business Logic (WAC)</b>"]
    Repository["Spring Data JPA<br/><b>Entity Repositories</b>"]
    DB[("MySQL 8.0<br/><b>Relational Data</b>")]

    Controller -- DTO Mapping --> Service
    Service -- Entities --> Repository
    Repository -- Hibernate --> DB
    
    classDef layer fill:#6DB33F,stroke:#000,stroke-width:2px,color:#fff;
    classDef database fill:#4479A1,stroke:#000,stroke-width:2px,color:#fff;
    
    class Controller,Service,Repository layer;
    class DB database;
```

---

## ✨ Core Backend Responsibilities

| Subsystem | Responsibility |
|-----------|----------------|
| **DTO Mapper** | Strictly isolates internal JPA entities from API consumers, ensuring precise JSON payload delivery. |
| **WAC Engine** | Intercepts fulfilled Purchase Orders to dynamically recalculate aggregate unit pricing across the inventory. |
| **Audit Interceptor** | Automatically listens for stock alterations and commits immutable logs to the `StockHistory` table. |
| **KPI Aggregator** | Offloads complex counting algorithms (Expiry, Out of Stock, Value) from the client to the server via `/api/dashboard/summary`. |

---

## ⚙️ Local Development

### Prerequisites
* Java 21
* MySQL 8.0+
* Maven

### Setup
1. Create a MySQL database named `restaurant_inventory`.
2. Configure `src/main/resources/application.properties` with your credentials:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

---

## 👨‍💻 Author

**Balakrishna Kini**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/balakrishna-kini)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Balakrishna-kini)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:balakrishnakini22@gmail.com)
