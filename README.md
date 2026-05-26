# AI-Powered Learning Platform — EdTech SaaS Application
## 1. Overview
  A full-stack AI-powered EdTech SaaS platform designed to enhance personalized learning experiences.
Enables students to learn smarter using AI-generated study plans, adaptive content, and real-time collaboration.
Built with modern web technologies to ensure scalability, performance, and secure data handling.
## 2. Core Features
1. AI-driven learning system using ChatGPT API for generating courses, notes, and quizzes.
2. Personalized study plans based on user progress and performance analytics.
3. Intelligent AI chatbot for doubt solving and learning assistance.
4. Real-time group chat and discussion rooms using WebSocket technology.
5. Progress tracking dashboard with performance insights and completion stats.
6. Google Calendar integration for automated study scheduling and reminders.
7. Secure authentication system with role-based access control (Student, Teacher, Admin).
## 3. Tech Stack
  Frontend: React 19, Tailwind CSS, Redux Toolkit
  Backend: Node.js 24, Express.js
  Database: PostgreSQL 18
  Caching: Redis for session management and performance optimization
  AI Integration: OpenAI ChatGPT API, prompt engineering
  Real-time Communication: Socket.io (WebSockets)
  DevOps: Docker, environment-based configuration
## 4. System Workflow
1. User interacts with React frontend (dashboard, courses, chat).
2. Frontend communicates with backend REST APIs.
3. Backend processes data and stores it in PostgreSQL.
4. Redis caches frequently used data for faster response.
5. AI module generates content using ChatGPT API.
6. WebSocket server handles real-time messaging and group chats.
## 5. Installation Guide
1. Clone the repository from GitHub.
2. Install backend dependencies using npm install.
3. Configure environment variables (.env) for database, JWT, and API keys.
4. Run backend server using npm run dev.
5. Install frontend dependencies and start development server.
6. Use Docker Compose for containerized deployment.
## 6. API Modules
1. Authentication API → login, register, token validation
2. Courses API → create, update, delete courses
3. AI API → generate notes, quizzes, and study plans
4. Progress API → track user learning progress
5. Chat API → real-time communication system
## 7. AI Capabilities
1. Generates personalized learning content dynamically
2. Creates quizzes based on difficulty level
3. Acts as an interactive AI tutor for students
4. Suggests optimized learning paths using user behavior
## 8. Key Benefits
1. Improves learning efficiency through AI personalization
2. Enables collaborative learning with real-time chat
3. Reduces manual teaching effort using automation
4. Provides scalable SaaS architecture for institutions
## 9. Future Scope
1. AI voice assistant for hands-free learning
2. Mobile application using React Native
3. Gamification with rewards, XP, and leaderboards
4. Multi-language AI support for global users

## Developer Info
Developed by: GK 

