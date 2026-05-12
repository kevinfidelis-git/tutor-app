# Tutor System — Modernized

> Full-stack modernization of a 2016 Laravel + AngularJS bachelor thesis into a production-ready Go + React + TypeScript application.

[![Go](https://img.shields.io/badge/go-1.26-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react)](https://react.dev/)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker)](https://docs.docker.com/compose/)

---

## 📚 Background & Origins

This project modernizes my **2016 bachelor thesis** at **Petra Christian University**, originally built with Laravel and AngularJS to support tutor assistant services at the university.

### 📄 Published Paper

The original thesis research was published in *Jurnal Infra*:

> Fidelis, Kevin, et al. "Pembuatan Web Application Untuk Mendukung Pelayanan Asisten Tutor Di Universitas Kristen Petra." *Jurnal Infra*, vol. 5, no. 1, 2017, pp. 153-159.  
> 🔗 [Read on Neliti](https://www.neliti.com/publications/111502/pembuatan-web-application-untuk-mendukung-pelayanan-asisten-tutor-di-universitas)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Go 1.26, Gin Framework, PostgreSQL 18, Redis 8.6 |
| **Frontend** | React 19, TypeScript, Vite 8, Bootstrap 5, React-Bootstrap |
| **DevOps** | Docker Compose (Go + React + PostgreSQL + Redis) |
| **Auth** | JWT with role-based access control |

---

## 🚀 Quick Start

```bash
# Start all services
docker compose up --build

# Access points
→ Frontend:    http://localhost:3000
→ Backend API: http://localhost:8080
→ Health:      http://localhost:8080/health
```

---

## 📁 Project Structure

```
tutor-app/
├── docker-compose.yml       # 4-service orchestration
├── backend/
│   ├── Dockerfile           # Go with hot-reload (Air)
│   ├── main.go              # Gin server, JWT middleware
│   ├── handlers/            # API handlers (REST)
│   ├── models/              # Domain models
│   └── migrations/          # 22-table PostgreSQL schema
└── frontend/
│   ├── Dockerfile           # Vite dev server
│   ├── src/
│   │   ├── main.tsx         # React entry point
│   │   ├── App.tsx          # Router setup
│   │   ├── components/      # Shared UI (Navbar, etc.)
│   │   └── pages/           # Route views (Landing, GuestBook, etc.)
│   └── package.json
└── README.md
```

---

## ✨ Implemented Features

| Feature                            | Status | Notes                       |
| ---------------------------------- | ------ | --------------------------- |
| Docker multi-service setup         | ✅      | Hot-reload for Go and React |
| Landing page with login            | ✅      | Responsive Bootstrap 5      |
| Guest Book (Buku Tamu)             | ✅      | Full CRUD API + frontend    |
| JWT authentication                 | 🔄     | In progress                 |
| Role dashboards (Admin/Astor/Maba) | 🔄     | In progress                 |
| Redis caching                      | 🔄     | Configured, selective use   |

---

## 🔐 Architecture Highlights

- Containerized development — consistent environment across machines
- Type-safe frontend — TypeScript with strict mode
- RESTful API design — clean separation of concerns
- Database migrations — version-controlled schema (22 tables)
- CORS handling — secure cross-origin communication
- Responsive UI — mobile-first with React-Bootstrap

---

## 📜 License

Copyright (c) 2026 Kevin Fidelis. All rights reserved.

This source code is provided for viewing and reference purposes only. Unauthorized use, modification, distribution, or commercial exploitation is strictly prohibited without prior written permission.

---

> 💬 *This is a personal modernization project demonstrating full-stack development skills. The original thesis system was developed for academic purposes at Universitas Kristen Petra (2016).*

---
