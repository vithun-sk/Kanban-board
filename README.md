# 📋 Collaborative Kanban Board – FlowSync

FlowSync is a modern, enterprise-ready full-stack project management and collaboration platform. It provides agile teams with a visual Kanban workflow, task tracking, deadline management, team coordination, messaging, and real-time activity metrics.

FlowSync supports **Dual-Mode Execution**:
1. **API Mode (Full Stack)**: Connects to a Java 21 Spring Boot REST API with MySQL persistence, Flyway migrations, stateless JWT authentication, and server-side authorization.
2. **Demo Mode (Offline / Sandbox)**: Runs entirely client-side using localStorage persistence, allowing instant zero-setup exploration and testing without requiring external infrastructure.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Radix UI primitives |
| **Backend** | Java 21, Spring Boot 3.4.3, Spring Security 6, Spring Data JPA, Hibernate 6 |
| **Database & Migration** | MySQL 8.0, Flyway Database Migrations |
| **Authentication & Security** | BCrypt password hashing, JJWT (0.12.6), Stateless Bearer Token Filter |
| **Build & Tooling** | Maven Wrapper (`mvnw`), npm, Oxlint |

---

## 🧩 Key Features

- **📊 Comprehensive Dashboard**: Real-time project and task metrics, in-progress workloads, overdue task tracking, recent projects, and workspace activity log.
- **📋 Visual Kanban Board**: Drag-and-drop or column-based status movement across `To Do`, `In Progress`, `In Review`, and `Done` states.
- **📁 Project Management**: Create, view, edit, and delete projects. Custom project color badges, visibility toggles, start dates, deadlines, and dynamic completion progress calculations.
- **👥 Project Members & Collaboration**: Assign registered members to projects with specific roles (`Owner`, `Admin`, `Member`, `Viewer`).
- **✅ Task Management**: Full task lifecycle with priorities (`Low`, `Medium`, `High`, `Urgent`), assignees, start and due dates, labels, and overdue status indicators.
- **📅 Interactive Calendar**: Monthly calendar view with task distribution, overdue highlights, and quick task status inspection.
- **💬 Team Messaging**: Real-time multi-conversation chat between workspace members with unread indicators.
- **🔔 Notifications**: Activity-driven notifications for task updates, project assignments, and deadlines, with individual read and mark-all-read capabilities.
- **🔐 Secure Authentication**: Real registration and login flows with email validation, password masking toggles, BCrypt encryption, and persistent JWT session management.
- **⚙️ User Preferences & Security**: Profile updates, password changes, notification preferences, and light/dark theme switching.

---

## 📁 Repository Structure

```text
Collaborative-Kanban-Board/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/flowsync/
│   │   │   │   ├── auth/            # AuthController, AuthService, JWT response DTOs
│   │   │   │   ├── common/          # ApiResponse<T>, ErrorResponse wrappers
│   │   │   │   ├── config/          # DevDataSeeder, CORS, web configs
│   │   │   │   ├── exception/       # GlobalExceptionHandler, custom exceptions
│   │   │   │   ├── message/         # Conversation and Message entities, controller, service
│   │   │   │   ├── notification/    # Notification entity, controller, service
│   │   │   │   ├── project/         # Project & ProjectMember entities, controller, service
│   │   │   │   ├── security/        # SecurityConfig, JwtService, JwtAuthenticationFilter
│   │   │   │   ├── task/            # Task entity, status/priority enums, controller, service
│   │   │   │   ├── user/            # User entity, UserController, UserService
│   │   │   │   └── FlowSyncApplication.java
│   │   │   └── resources/
│   │   │       ├── db/migration/    # V1__init_schema.sql (Flyway relational schema)
│   │   │       └── application.properties
│   │   └── test/
│   │       ├── java/com/flowsync/   # Integration & unit test suite (Auth, Tasks, Projects, JWT)
│   │       └── resources/application-test.properties # In-memory H2 MySQL mode test DB
│   ├── pom.xml                      # Maven dependencies (Java 21, Spring Boot 3.4.3)
│   ├── mvnw & mvnw.cmd              # Maven wrapper executables
│   └── .env.example                 # Backend environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── components/              # UI, layout, kanban, task, project, and auth components
│   │   ├── config/                  # env.js configuration loader
│   │   ├── constants/               # Statuses, priorities, storage keys
│   │   ├── context/                 # AppContext (dual-mode state), ToastContext
│   │   ├── data/                    # Initial seed data for offline demo mode
│   │   ├── lib/                     # Utilities (dates, storage, validation, IDs)
│   │   ├── pages/                   # Route pages (Home, Projects, Tasks, Calendar, Teams, etc.)
│   │   └── services/                # REST API clients, endpoints, selectors, demo repository
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example                 # Frontend environment variable template
│
├── .gitignore                       # Ignored build outputs, caches, secrets, and .env files
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Java JDK 21+**
- **Node.js 18+ & npm 9+**
- **MySQL Server 8.0+** (for real API mode)
- **Apache Maven 3.9+** (or use the included `./mvnw` / `mvnw.cmd`)

---

### Backend Setup (Spring Boot & MySQL)

#### 1. Create MySQL Database
Log into your MySQL client and create a new database:
```sql
CREATE DATABASE flowsync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` or set environment variables in your terminal:
```bash
cp backend/.env.example backend/.env
```

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | Port for Spring Boot HTTP server |
| `DB_URL` | `jdbc:mysql://localhost:3306/flowsync?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | JDBC database connection string |
| `DB_USERNAME` | `root` | MySQL database username |
| `DB_PASSWORD` | *(empty)* | MySQL database password |
| `JWT_SECRET` | *(built-in 256-bit dev key)* | Minimum 256-bit secret key for HMAC-SHA256 signing |
| `JWT_EXPIRATION_MS` | `86400000` (24 hours) | JWT token lifespan in milliseconds |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed origins for web frontend |
| `DEV_SEED_ENABLED` | `false` | When `true`, automatically creates demo seed accounts on startup |

#### 3. Run the Backend
Using Maven Wrapper:
- **Windows**:
  ```powershell
  cd backend
  .\mvnw.cmd spring-boot:run
  ```
- **macOS / Linux**:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```

Flyway will automatically execute `V1__init_schema.sql` on startup, creating all tables and relational indexes. The API will be available at `http://localhost:8080/api/v1`.

---

### Frontend Setup (React & Vite)

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Configure Frontend Mode
Create or modify `frontend/.env`:
- **For API Mode (Connecting to Spring Boot Backend)**:
  ```env
  VITE_DEMO_MODE=false
  VITE_API_BASE_URL=http://localhost:8080/api/v1
  ```
- **For Demo Mode (Offline Client-Only Exploration)**:
  ```env
  VITE_DEMO_MODE=true
  VITE_API_BASE_URL=
  ```

#### 3. Start the Frontend Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📡 REST API Reference

All backend responses are wrapped in a standard JSON envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-10-20T10:00:00Z"
}
```

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/v1/auth/me` | Bearer Token | Get current authenticated user profile |

### User Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | Bearer Token | List all registered workspace users |
| `GET` | `/api/v1/users/me` | Bearer Token | Get active user profile |
| `PATCH` | `/api/v1/users/me` | Bearer Token | Update user profile details |
| `POST` | `/api/v1/users/me/change-password` | Bearer Token | Change password with current password verification |

### Project Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/projects` | Bearer Token | List all projects accessible to current user |
| `POST` | `/api/v1/projects` | Bearer Token | Create a new project |
| `GET` | `/api/v1/projects/{id}` | Bearer Token | Get project details by ID |
| `PATCH` | `/api/v1/projects/{id}` | Bearer Token | Update project information |
| `DELETE` | `/api/v1/projects/{id}` | Bearer Token | Delete project (Owner/Admin only) |
| `GET` | `/api/v1/projects/{id}/members` | Bearer Token | List project members |
| `POST` | `/api/v1/projects/{id}/members` | Bearer Token | Add registered member to project |
| `PATCH` | `/api/v1/projects/{id}/members/{memberId}` | Bearer Token | Update member role |
| `DELETE` | `/api/v1/projects/{id}/members/{memberId}` | Bearer Token | Remove member from project |

### Task Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | Bearer Token | List all tasks across accessible projects |
| `POST` | `/api/v1/tasks` | Bearer Token | Create a task |
| `GET` | `/api/v1/tasks/{id}` | Bearer Token | Get task details |
| `PATCH` | `/api/v1/tasks/{id}` | Bearer Token | Update task details |
| `PATCH` | `/api/v1/tasks/{id}/status` | Bearer Token | Move task status (`To Do`, `In Progress`, `In Review`, `Done`) |
| `DELETE` | `/api/v1/tasks/{id}` | Bearer Token | Delete task |

### Notification & Message Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | Bearer Token | List current user notifications |
| `PATCH` | `/api/v1/notifications/{id}/read` | Bearer Token | Mark notification as read |
| `PATCH` | `/api/v1/notifications/read-all` | Bearer Token | Mark all notifications as read |
| `DELETE` | `/api/v1/notifications/{id}` | Bearer Token | Dismiss notification |
| `GET` | `/api/v1/conversations` | Bearer Token | List conversations for user |
| `POST` | `/api/v1/conversations` | Bearer Token | Create or find direct conversation |
| `GET` | `/api/v1/conversations/{id}/messages` | Bearer Token | Get conversation messages |
| `POST` | `/api/v1/conversations/{id}/messages` | Bearer Token | Post a message to conversation |

---

## 🧪 Testing & Verification

### Backend Automated Test Suite
The backend contains automated tests verifying JWT security, user registration, project isolation, authorization checks, and task status lifecycles.

To run the backend test suite:
```powershell
cd backend
.\mvnw.cmd test
```
*Current Status: 6/6 tests passing (0 failures, 0 errors).*

To package the production standalone executable JAR:
```powershell
cd backend
.\mvnw.cmd package -DskipTests
```
*Generated output: `backend/target/flowsync-backend-1.0.0.jar`*

### Frontend Lint and Build Verification
```powershell
cd frontend
npm run lint
npm run build
```
*Current Status: 0 errors, build succeeds in under 600ms.*

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: Secrets and database credentials are fully configurable via environment variables.
- **Stateless Bearer JWT Authentication**: Fast, horizontally scalable token verification with BCrypt encrypted passwords.
- **Server-Side Authorization**: Project and task modification permissions are strictly validated in the Spring Boot service layer, protecting APIs against unauthorized client requests.
- **Transactional Integrity**: All database mutation operations are wrapped in `@Transactional` blocks to guarantee consistency.
- **SQL Injection Prevention**: Spring Data JPA and Hibernate use parameterized queries across all entities.

---

## 🧑‍💻 Developed by

**Vithun S K**  
Frontend Web Developer \| Full Stack Learner  
📧 Email: [vithunkumar07@gmail.com](mailto:vithunkumar07@gmail.com)  
🔗 LinkedIn: [https://www.linkedin.com/in/vithun-sk/](https://www.linkedin.com/in/vithun-sk/)  
🐙 GitHub: [https://github.com/vithun-sk](https://github.com/vithun-sk)
