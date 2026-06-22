# 🛍️ Aesthetic E-Commerce Website

An elegant and minimal **E-Commerce Web Application** built using **Java Spring Boot + Hibernate + H2 Database + React**.

Designed with an aesthetic UI and essential shopping functionalities for both users and admin management.

---

## ✨ Features

### 👤 User Side
- 🏠 Beautiful aesthetic homepage
- 🛒 Browse product catalog
- 🔍 View product details
- 🧾 Add products to cart
- 💳 Place orders using **Cash on Delivery (COD)**
- 📦 Order placement workflow
- 👥 User registration & login

### 🛠️ Admin Side
- ➕ Add new products
- ✏️ Update existing products
- ❌ Delete products
- 📋 Manage product catalog
- 📦 Monitor customer orders

---

## 🧑‍💻 Tech Stack

### Frontend
- ⚛️ React
- 🎨 CSS
- 🌐 HTML

### Backend
- ☕ Java
- 🍃 Spring Boot
- 🗄️ Hibernate (JPA)

### Database
- 💾 H2 Database

### Build Tools
- 📦 Maven

---

## 📂 Project Structure

```plaintext
project-root/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── config/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── services/
│
└── README.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
```

---

### 2️⃣ Backend Setup

Move to backend folder:

```bash
cd backend
```

Run Spring Boot:

```bash
mvn spring-boot:run
```

Backend will start on:

```plaintext
http://localhost:8080
```

---

### 3️⃣ Frontend Setup

Move to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run React app:

```bash
npm start
```

Frontend will start on:

```plaintext
http://localhost:3000
```

---

## 🗄️ Database Access (H2)

Open:

```plaintext
http://localhost:8080/h2-console
```

Example credentials:

```plaintext
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password:
```

*(Update if different in application.properties)*

---

## 📸 Screenshots

Add your screenshots here 👇

### 🏠 Homepage
![Homepage](screenshots/homepage.png)

### 🛒 Product Catalog
![Catalog](screenshots/catalog.png)

### 🧾 Cart Page
![Cart](screenshots/cart.png)

### 🛠️ Admin Dashboard
![Admin](screenshots/admin.png)

---

## 🌟 Future Improvements

- 💳 Online Payment Gateway
- ❤️ Wishlist Feature
- 🔎 Advanced Search & Filters
- 📱 Responsive Mobile Design
- 📦 Order Tracking
- ⭐ Product Reviews

---

## 🎯 Learning Outcomes

This project helped in understanding:

- Spring Boot Architecture
- Hibernate ORM
- REST APIs
- React Components & State Management
- Frontend–Backend Integration
- CRUD Operations

---

## 🤝 Contributions

Contributions are welcome!

Fork 🍴 → Create Branch 🌱 → Commit 💾 → Push 🚀 → Pull Request 🔥
