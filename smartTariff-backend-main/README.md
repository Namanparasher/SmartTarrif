# SmartTariff Backend API

SmartTariff Backend is a high-performance RESTful API built with **FastAPI**, **SQLAlchemy**, and **SQLite**, designed to deliver intelligent electricity and mobile tariff recommendations, consumption tracking, and role-based portal administration.

---

## 🚀 Features

- **Authentication & Security**: Secure JWT Access and Refresh token workflows with bcrypt password hashing.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `customer` and `admin` roles.
- **Intelligent Recommendation Engine**: Machine learning model integration with rule-based fallback and transparent explainability insights.
- **Plan Management**: CRUD APIs for managing consumer and enterprise tariff plans.
- **Usage & Consumption Tracking**: Real-time tracking of internet, voice, SMS, and energy consumption metrics.
- **Customer Feedback & Admin Analytics**: User ratings, reviews, and aggregated dashboard statistics.
- **Vercel Serverless Ready**: Configured with `vercel.json` and ASGI handler in `api/index.py`.

---

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database & ORM**: SQLite + SQLAlchemy 2.0
- **Authentication**: Python-Jose (JWT) + Passlib (Bcrypt)
- **Settings & Validation**: Pydantic v2 + Pydantic-Settings
- **HTTP Client**: HTTPX
- **Deployment**: Vercel Serverless / Uvicorn

---

## 📦 Getting Started

### Prerequisites
- Python 3.10 or higher
- `pip`

### Installation

```bash
# Clone the repository
git clone https://github.com/nitinkumartec1/smartTariff-backend.git
cd smartTariff-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=8000
NODE_ENV=development

JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
ACCESS_TOKEN_EXPIRES_MINUTES=15
REFRESH_TOKEN_EXPIRES_DAYS=7

# CORS Allowed Origin
CLIENT_URL=http://localhost:5173
```

### Run Locally

```bash
uvicorn main:app --reload --port 8000
```

- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative Docs (ReDoc)**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/v1/health`

---

## 🌐 Deploying to Vercel

The backend includes a `vercel.json` and `api/index.py` serverless adapter.

1. Connect your repository to Vercel.
2. Set Root Directory to `backend` (if deploying from monorepo) or root.
3. Configure the environment variables (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`).
4. Deploy!

---

## 📄 License

MIT License
