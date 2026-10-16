<div align="center">

# 🛒 RIDWAN BUSINESS

### Full-Stack E-Commerce Web Application

A modern e-commerce platform built to provide a seamless online shopping experience, with secure authentication, product management, payment integration, and a dedicated administration dashboard.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Developer:** Alordey Richmond

**Project Status:** ✅ Development Completed | 🚀 Deployment Configuration in Progress

</div>

---

## 📖 Project Overview

Ridwan Business is a full-stack e-commerce application designed to help customers browse products, manage shopping carts, and place orders through an intuitive online shopping interface.

The application also includes a dedicated administration system for managing products, inventory information, and orders.

The project demonstrates practical full-stack development using React, Node.js, Express.js, MongoDB, and third-party service integrations.

### 🎯 Project Objectives

- Develop a responsive and user-friendly online store.
- Build RESTful APIs for frontend-backend communication.
- Implement user authentication and authorization.
- Provide an administrative interface for managing products.
- Integrate online payment functionality.
- Implement cloud-based product image storage.
- Create a scalable foundation for future e-commerce features.

---

## ✨ Key Features

### 🛍️ Customer Features

- Responsive shopping interface
- Product browsing
- Product categories
- Product details
- Shopping cart management
- User registration and login
- Order placement
- Order history
- Paystack online payment integration
- Cash on Delivery payment option
- Customer account management

### 🔐 Authentication & Security

- JWT-based authentication
- Password hashing
- Protected API endpoints
- Role-based access for administrative functionality
- Environment-based configuration

### 🛠️ Admin Dashboard

- Administrative interface
- Add new products
- View available products
- Update product information
- Delete products
- Upload and manage product images
- Manage product categories
- View and manage customer orders

### 💳 Payment Integration

- Paystack payment integration
- Payment verification workflow
- Payment callback handling
- Payment webhook integration
- Cash on Delivery support

### ☁️ Cloud Image Management

- Cloudinary integration
- Product image uploads
- Cloud-hosted media storage

---

## 🧰 Technology Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS3, Bootstrap, React Bootstrap |
| Animations | Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Payments | Paystack |
| Image Storage | Cloudinary |
| API Communication | Axios, REST APIs |
| Version Control | Git, GitHub |
| Frontend Hosting | Vercel |
| Backend Hosting | Deployment configuration in progress |

---

## 🏗️ Project Architecture

The application follows a client-server architecture.

```text
                    RIDWAN BUSINESS
                           |
          +----------------+----------------+
          |                                 |
     Customer Frontend                Admin Dashboard
          |                                 |
          +----------------+----------------+
                           |
                      REST API
                           |
                 Node.js / Express.js
                           |
          +----------------+----------------+
          |                |                |
       MongoDB          Paystack        Cloudinary
       Database         Payments        Image Storage
```

### Architecture Explanation

**Customer Frontend**

Provides the interface customers use to browse products, manage their shopping carts, and place orders.

**Admin Dashboard**

Provides a dedicated interface for managing products and orders.

**Backend API**

Handles business logic, authentication, database communication, and third-party integrations.

**MongoDB**

Stores application data such as users, products, categories, and orders.

**Paystack**

Provides payment processing functionality.

**Cloudinary**

Handles cloud-based product image storage.

---

## 📂 Project Structure

```text
RIDWANS-BUSSINESS/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── admin/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## ⚙️ Installation & Local Development

### Prerequisites

Before running the application, ensure that you have:

- Node.js installed
- npm installed
- Git installed
- A MongoDB connection
- The necessary environment variables
- The required third-party service credentials for payment and image uploads

### 1. Clone the Repository

```bash
git clone https://github.com/lilbonaf-prog/RIDWANS-BUSSINESS.git
```

Navigate into the project:

```bash
cd RIDWANS-BUSSINESS
```

### 2. Install and Start the Backend

Open a terminal:

```bash
cd backend
npm install
```

Configure the required environment variables for your local environment.

Then start the development server:

```bash
npm run dev
```

### 3. Install and Start the Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL.

### 4. Install and Start the Admin Dashboard

Open a third terminal from the project root:

```bash
cd admin
npm install
npm run dev
```

Vite will display the admin dashboard URL.

### 5. Configure Environment Variables

The backend requires appropriate configuration for services such as:

- MongoDB Atlas
- JWT authentication
- Paystack
- Cloudinary
- Frontend and backend communication

Use the environment variable names expected by the project's source code.

**Security Notice:**

Never commit actual API keys, passwords, database credentials, or `.env` files containing secrets to GitHub.

---

## 📱 Responsive Design

Ridwan Business is designed to support different screen sizes and devices.

The customer-facing interface incorporates:

- Responsive layouts
- Mobile-friendly navigation
- Product grids
- Interactive shopping components
- Modern interface animations

---

## 🖼️ Application Screenshots

Screenshots of the completed application will be added to demonstrate:

1. Homepage
2. Product listing
3. Product details
4. Shopping cart
5. Checkout
6. Customer account
7. Admin dashboard
8. Product management

---

## 🌍 Deployment

The application uses separate frontend, backend, and administration components.

The frontend and admin applications have been deployed using Vercel.

Backend hosting and final production integration are being completed.

**Deployment Status:** Final hosting configuration pending.

A fully verified live demonstration will be provided after the remaining deployment work is complete.

---

## 📚 What I Learned

Building Ridwan Business strengthened my practical understanding of:

- Full-stack application development
- React component architecture
- RESTful API development
- Database modeling with MongoDB
- Authentication using JWT
- Connecting frontend and backend applications
- Payment gateway integration
- Cloud media management
- Application deployment
- Debugging and maintaining web applications

---

## 🔮 Future Improvements

Potential future enhancements include:

- Advanced product search and filtering
- Product reviews and ratings
- Inventory analytics
- Sales reporting dashboards
- Improved order tracking
- Automated customer notifications
- Performance optimization
- Additional payment options

---

## 👨‍💻 Developer

**Alordey Richmond**

Full-Stack Developer

📍 Accra, Ghana

Passionate about building practical, responsive, and scalable software applications.

### Connect With Me

**GitHub:** [lilbonaf-prog](https://github.com/lilbonaf-prog)

**Portfolio:** Coming Soon

**LinkedIn:** Coming Soon

---

<div align="center">

### Built with dedication by Alordey Richmond

⭐ If you find this project interesting, consider giving the repository a star!

</div>
