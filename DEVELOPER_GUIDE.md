# Cato Academy Developer Guide

Welcome to the Cato Academy project! This guide provides a comprehensive overview of the technical architecture, tech stack, folder structure, and setup instructions to help you get started quickly.

## 🏗 Project Architecture

Cato Academy is built using a modern decoupled architecture with a clear separation between the frontend and backend.

### Frontend-Backend Communication
- **API**: The frontend communicates with the backend via a RESTful API built with Django REST Framework (DRF).
- **Authentication**: Authentication is handled using JWT (JSON Web Tokens). For security, tokens are stored in **HttpOnly cookies**, preventing XSS attacks from accessing them. A custom authentication backend `JWTCookieAuthentication` in the Django app handles token extraction from cookies.
- **State Management**: The frontend uses **Zustand** for lightweight and efficient state management, particularly for authentication and user sessions.
- **Async Tasks**: Heavy operations (like HLS video processing) are offloaded to **Celery** with **Redis** as a message broker.

---

## 🛠 Tech Stack

### Backend
- **Framework**: Django 6.0 & Django REST Framework (DRF)
- **Database**: PostgreSQL (main data store), SQLite (optional for quick local testing)
- **Authentication**: Djoser & SimpleJWT (with cookie-based customization)
- **Task Queue**: Celery & Redis
- **Storage**: Django Storages (Boto3 for AWS S3 compatibility)
- **Documentation**: DRF Spectacular (OpenAPI 3.0)
- **Profiling**: Django Silk

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Video Player**: Video.js
- **State Management**: Zustand
- **Data Fetching**: Axios (with interceptors for automatic token refresh)

---

## 📁 Folder Structure

```text
.
├── courses/            # Backend: Course management, modules, lessons, and HLS logic
├── users/              # Backend: Custom user model, authentication, and profiles
├── payments/           # Backend: Stripe integration and transaction history
├── lern/               # Backend: Core project configuration (settings, URLs, Celery)
├── fronted/            # Frontend: React application source code
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View components (Routes)
│   │   ├── services/   # API communication (Axios)
│   │   ├── store/      # Zustand state stores
│   │   └── assets/     # Images, styles, etc.
├── media/              # Media files (Local uploads, processed HLS segments)
├── scripts/            # Utility and maintenance scripts
├── docker-compose.yml  # Docker config for running PostgreSQL locally
├── manage.py           # Django management CLI
├── requirements.txt    # Python dependencies
└── package.json        # Frontend build scripts (Note: main logic is in fronted/package.json)
```

---

## 🚀 Setup Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Docker (for database)
- Redis (for Celery)

### 2. Backend Setup
1. **Clone the repository** and navigate to the root.
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Create a `.env` file based on the project requirements (DB credentials, Stripe keys, etc.).
5. **Start PostgreSQL**:
   ```bash
   docker-compose up -d
   ```
6. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```
7. **Start the Development Server**:
   ```bash
   python manage.py runserver
   ```

### 3. Celery Setup (Optional - for video processing)
1. **Ensure Redis is running**.
2. **Start the worker**:
   ```bash
   celery -A lern worker -l info
   ```

### 4. Frontend Setup
1. **Navigate to the frontend directory**:
   ```bash
   cd fronted
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The site should now be accessible at `http://localhost:5173`.

---

## 🧪 Testing and Verification
- **Backend Tests**: `python manage.py test`
- **API Verification**: Use the provided `verify_api.py` script.
- **Frontend Linting**: `npm run lint` inside the `fronted` folder.
