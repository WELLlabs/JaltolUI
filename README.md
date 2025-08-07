# JaltolUI - Frontend Application

A React-based frontend application for the Jaltol platform, built with Vite, providing a modern and responsive user interface for impact assessment and project management.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/WELLLABS_GITHUB.git
   cd WELLLABS_GITHUB/JaltolUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   **If you encounter dependency errors, install these additional packages:**
   ```bash
   npm install react react-dom
   npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader
   ```

3. **Set up environment variables** (see [Environment Configuration](#environment-configuration))

4. **Start development server**
   ```bash
    npm run dev
     ```

5. **Open in browser**
   - Visit: `http://localhost:5173`

## 🔧 Environment Configuration

### Required Environment Files

Create the following files in the `JaltolUI/` root directory:

#### `.env` (Development)
```env
# Development Environment Variables
VITE_API_URL=http://127.0.0.1:8000/api
VITE_ENVIRONMENT=development
```

#### `.env.production` (Production)
```env
# Production Environment Variables
VITE_API_URL=https://app.jaltol.app/api
VITE_ENVIRONMENT=production
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint URL | `http://127.0.0.1:8000/api` |
| `VITE_ENVIRONMENT` | Current environment | `development` or `production` |

> **Note:** In Vite, environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🏗️ Project Structure

```
JaltolUI/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── context/            # React Context providers
│   ├── services/           # API service functions
│   └── assets/             # Static assets
├── public/                 # Public static files
├── .env                    # Development environment variables
├── .env.production         # Production environment variables
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 🔗 Backend Integration

This frontend connects to the **JaltolAPI** Django backend. Ensure the backend is running before starting the frontend:

### Development Setup
1. Start the Django backend on `http://127.0.0.1:8000`
2. The frontend will automatically connect using the `VITE_API_URL` from `.env`

### Production Setup
- The frontend connects to `https://app.jaltol.app/api` in production
- Configured via `.env.production`

## 🛠️ Development Workflow

### 1. Making Changes

```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add: new feature description"
```

### 2. Testing Locally

```bash
# Start development server
npm run dev

# Test your changes at http://localhost:5173
# Ensure backend is running at http://127.0.0.1:8000
```

### 3. Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### 4. Pushing Changes

```bash
# Push to your feature branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# After review and approval, merge to main
```

## 🚀 Deployment

### Development Deployment
- Automatically uses `.env` configuration
- Connects to local backend (`http://127.0.0.1:8000`)

### Production Deployment
- Automatically uses `.env.production` configuration
- Connects to production backend (`https://app.jaltol.app/api`)

### Build Commands

```bash
# Development build
npm run build

# Production build (uses .env.production)
npm run build --mode production
```

## 🔐 Security Notes

- **Never commit `.env` files** - They're automatically ignored by `.gitignore`
- **API keys and secrets** should only be stored in environment variables
- **HTTPS only** in production environments

## 📱 Features

- **Interactive Maps** - Village boundary visualization and analysis
- **Authentication** - Google OAuth integration
- **Project Management** - Create, save, and manage assessment projects
- **Impact Assessment** - Land use change analysis and reporting
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## 🐛 Troubleshooting

### Common Issues

1. **"process is not defined" error**
   - Use `import.meta.env.VITE_*` instead of `process.env.*`

2. **API connection failed**
   - Check if backend is running
   - Verify `VITE_API_URL` in your `.env` file

3. **Build fails**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript/ESLint errors

4. **Environment variables not working**
   - Ensure variables are prefixed with `VITE_`
   - Restart the dev server after adding new variables

### Getting Help

- Check the browser console for error messages
- Verify network requests in browser dev tools
- Ensure backend API is accessible and running

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Happy coding! 🚀**