# 📋 Collaborative Kanban Board – FlowSync

FlowSync is a full-stack web application designed to simplify project management and team collaboration. Teams often manage their work through scattered messages, spreadsheets, and separate tools, making it difficult to track task progress, manage deadlines, and coordinate responsibilities. Collaborative Kanban Board provides a centralized platform where users can create projects, organize tasks, collaborate with team members, and track project progress through a visual Kanban board.

---

## 📖 About the Project

Collaborative Kanban Board is designed to make team-based project management simpler and more organized.

- Teams need a clear way to divide projects into manageable tasks.
- Members need to know which tasks are pending, in progress, under review, or completed.
- Project owners need to track progress, assign responsibilities, and manage deadlines.
- Team members need a common place to communicate and collaborate.

FlowSync aims to solve these problems by providing a unified workspace for project planning, task tracking, team collaboration, and progress monitoring.

---

## 🧩 Key Features

### 📊 Dashboard
- Overview of projects, tasks, and completion progress.
- Statistics for pending, in-progress, and completed tasks.
- Recent projects and assigned tasks.
- Quick access to important project activities.

### 📁 Project Management
- Create and manage projects.
- View project details, status, and progress.
- Search and filter projects.
- Organize project information in one place.

### 📋 Kanban Board
- Organize tasks into workflow columns such as `To Do`, `In Progress`, `In Review`, and `Done`.
- Visualize task progress using task cards.
- Update task status as work progresses.
- View task details without navigating to a separate page.

### ✅ Task Management
- Create, edit, and manage tasks.
- Assign tasks to team members.
- Set task priorities and due dates.
- Track task status and completion.
- Add task descriptions and comments.

### 👥 Team Collaboration
- Organize members within projects.
- Assign responsibilities to team members.
- Support project roles and permissions.
- Share project updates and coordinate work.

### 💬 Team Communication
- Project-specific discussions and task comments.
- Share updates and discuss work-related issues.
- Potential real-time messaging using WebSockets.

### 📅 Calendar
- View tasks and deadlines in a calendar.
- Track upcoming due dates.
- Plan project activities more effectively.

### 🔔 Notifications and Activity
- Notify users about relevant task assignments and updates.
- Highlight approaching deadlines.
- Track important project activities.

### 🔍 Review and Approval Workflow
- Submit completed tasks for review.
- Allow authorized reviewers to approve tasks or request changes.
- Track the review status of tasks.

### 🔐 Authentication and Authorization
- User registration and login.
- Secure authentication using Spring Security and JWT.
- Protected application routes and APIs.
- Role-based access control for authorized actions.

### ⚙️ User Settings
- Manage user profile information.
- Configure account preferences.
- Manage notification preferences.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React.js, Vite, JavaScript |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Backend** | Java, Spring Boot |
| **Database** | MySQL |
| **Authentication** | Spring Security, JWT |
| **API Communication** | REST APIs |
| **Real-Time Communication** | WebSockets, if implemented |
| **Version Control** | Git, GitHub |
| **Development Tools** | VS Code, Postman, IntelliJ IDEA or Eclipse |

---

## ✨ Project Highlights

- Centralized project and task management.
- Visual Kanban workflow for tracking progress.
- Task assignments, priorities, and deadlines.
- Team-based project collaboration.
- Role-based access control.
- Responsive user interface.
- Spring Boot REST API architecture.
- Persistent data storage using MySQL.
- Potential real-time communication and notifications.

---

## 🧰 Installation & Setup

Follow these steps to run the project locally after the frontend and backend have been configured.

### Prerequisites

Make sure you have installed:

- Node.js and npm
- Java JDK 21
- Maven
- MySQL Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Collaborative-Kanban-Board.git
```

### 2. Navigate into the project directory

```bash
cd Collaborative-Kanban-Board
```

### 3. Configure the MySQL database

Start your local MySQL server and create the database:

```sql
CREATE DATABASE flowsync;
```

### 4. Configure backend environment variables

Configure the database connection and authentication secret using your local environment or an appropriate environment configuration file.

Example values:

```env
DB_URL=jdbc:mysql://localhost:3306/flowsync
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_secret
```

These are example variable names. The actual names must match the Spring Boot configuration used in the project.

**Important:** Do not commit database passwords, production secrets, or real JWT secrets to GitHub.

### 5. Run the Spring Boot backend

From the backend directory, run:

```bash
./mvnw spring-boot:run
```

On Windows, use:

```bash
mvnw.cmd spring-boot:run
```

If the project uses a locally installed Maven instead of the Maven Wrapper, run:

```bash
mvn spring-boot:run
```

### 6. Install frontend dependencies

Open a separate terminal:

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

### 8. Open the application

Open the local URL displayed by Vite in your terminal, typically:

```text
http://localhost:5173
```

> **Note:** The commands above assume the repository uses `frontend/` and `backend/` directories. Update them if the final project structure differs. Database credentials, JWT configuration, and the frontend API URL must be configured before the full application can work.

---

## 📁 Project Structure

The following is the planned project structure. The final folders will be adjusted to match the actual implementation.

```text
Collaborative-Kanban-Board/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── calendar/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── Data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/flowsync/
│   │   │   │       ├── config/
│   │   │   │       ├── security/
│   │   │   │       ├── user/
│   │   │   │       ├── project/
│   │   │   │       ├── task/
│   │   │   │       ├── comment/
│   │   │   │       ├── chat/
│   │   │   │       ├── notification/
│   │   │   │       └── common/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

---

## 🔮 Future Enhancements

- Real-time Kanban board updates.
- Drag-and-drop task movement.
- Live project chat and notifications.
- Email reminders for approaching deadlines.
- Advanced project analytics and reports.
- File attachments for tasks.
- Improved project-level permission management.

---

## 🙌 Contributions

Contributions, issues, and feature requests are welcome!

Feel free to fork this repository and submit a pull request.

---

## 🧑‍💻 Developed by

**Vithun S K**

Frontend Web Developer | Full Stack Learner

📧 Email: [vithunkumar07@gmail.com](mailto:vithunkumar07@gmail.com)

🔗 LinkedIn: [https://www.linkedin.com/in/vithun-sk/](https://www.linkedin.com/in/vithun-sk/)

🐙 GitHub: [https://github.com/vithun-sk](https://github.com/vithun-sk)
