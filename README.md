📦 StockBridge Frontend
🧾 Project Overview

StockBridge Frontend is the user interface for a Multi-Branch Inventory & Transfer Management System.
It is designed to support role-based workflows for managing inventory across multiple branches, handling stock transfer requests, approvals, and reporting.

This frontend is built using Next.js (App Router) and communicates with a Spring Boot backend via REST APIs.

🎯 Key Objectives
Provide a responsive and role-based dashboard for all users
Enable seamless stock transfer requests between branches
Support multi-tier approval workflows
Display real-time inventory and stock levels per branch
Improve visibility and control of distributed inventory systems
👥 User Roles

The system supports four main roles:

🏪 Branch Staff
View branch stock
Create transfer requests
🧑‍💼 Branch Manager
Approve or reject transfer requests (first-level approval)
🏢 Head Office / Inventory Admin
Final approval of transfers
Manage global inventory and stock distribution
⚙️ Admin
Manage users and branches
System-level control and monitoring
🚀 Core Features
📦 Inventory Management
View stock per branch
Track item quantities and availability
Monitor low stock alerts
🔁 Stock Transfer Workflow
Request stock transfers between branches
Multi-level approval system:
Branch Manager → Head Office Approval
Track transfer status:
Pending → Approved → In Transit → Received → Completed
📊 Dashboard & Reporting
Role-based dashboards
Inventory overview
Transfer history tracking
Stock movement insights
👤 User & Branch Management
Create and manage users
Assign roles and permissions
Manage multiple branch locations
🔎 Search & Filtering
Filter by branch, item, status, and date
Quick search for inventory items and transfers
🧠 System Workflow (High Level)
Staff creates a transfer request
Branch Manager reviews and approves/rejects
Head Office gives final approval
Stock is moved and updated in inventory
System tracks full lifecycle of the transfer
🛠️ Tech Stack
Framework: Next.js 14+ (App Router)
UI Styling: Tailwind CSS / Bootstrap
State Management: React Context API
API Communication: Fetch / Axios (REST APIs)
Authentication: JWT-based authentication (via backend)
Language: JavaScript (React)
🔐 Authentication & Security
Role-based access control (RBAC)
JWT token authentication (handled by backend)
Protected routes for dashboards
Session persistence for logged-in users
📡 Backend Integration

This frontend connects to a Spring Boot REST API backend providing:

User authentication & authorization
Inventory management APIs
Transfer request workflows
Reporting and analytics data
