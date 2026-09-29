# SmartTariff Frontend

SmartTariff is an intelligent electricity tariff recommendation and analytics platform built with React, TypeScript, Vite, Tailwind CSS, and Redux Toolkit.

## 🚀 Features

- **Personalized Plan Recommendations**: AI/ML-driven tariff recommendations tailored to user consumption patterns.
- **Interactive Dashboards**: Role-based portals for both Customers and Administrators.
- **Consumption Analytics**: Deep insights, hourly usage trends, cost comparisons, and peak vs. off-peak analysis with Recharts.
- **Adaptive UI**: Responsive layouts, dark modern theme, and smooth UI animations.
- **Production Ready**: Configured for Vercel deployment with SPA routing and security/CORS headers.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit + React-Redux
- **Routing**: React Router v7
- **Icons & Charts**: Lucide React, Recharts
- **Notifications**: React Hot Toast

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/nitinkumartec1/smartTariff-frontend.git

# Navigate to directory
cd smartTariff-frontend

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000
VITE_CORS_ORIGIN=http://localhost:8000
VITE_CLIENT_URL=http://localhost:5173
```

### Development

```bash
# Start local development server
npm run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

## 🌐 Deployment on Vercel

The project contains a preconfigured `vercel.json` with client-side SPA routing and CORS headers.
Deploy effortlessly with the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## 📄 License

MIT License
