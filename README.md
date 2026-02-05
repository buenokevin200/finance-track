# Firefly III Frontend

A modern, responsive web application for managing personal finances using the Firefly III API.

## Features

- ✅ **Dashboard**: Real-time financial overview with metrics (Net Worth, Income, Expenses)
- ✅ **Accounts Management**: Full CRUD operations for asset, expense, and revenue accounts
- ✅ **Transactions**: Create, edit, and delete withdrawals, deposits, and transfers
- ✅ **Categories**: Organize transactions with custom categories and icons
- ✅ **Currencies**: Manage multiple currencies with enable/disable functionality
- ✅ **Dark Mode**: Automatic theme switching based on system preferences
- ✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A running Firefly III instance with API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fin-project
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your Firefly III credentials:
```env
VITE_FIREFLY_API_URL=/api/v1
VITE_FIREFLY_TOKEN=your-firefly-api-token
VITE_FIREFLY_URL=https://your-firefly-instance.com
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t firefly-frontend .

# Run the container
docker run -p 3000:80 firefly-frontend
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

### Build Arguments

You can customize the API URL at build time:

```bash
docker build --build-arg VITE_FIREFLY_API_URL=/api/v1 -t firefly-frontend .
```

## Project Structure

```
fin-project/
├── src/
│   ├── components/          # React components
│   │   ├── accounts/        # Account management
│   │   ├── auth/            # Authentication
│   │   ├── categories/      # Category management
│   │   ├── currencies/      # Currency management
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── layout/          # Layout components (Sidebar, etc.)
│   │   ├── transactions/    # Transaction management
│   │   └── common/          # Shared components (Button, Input, etc.)
│   ├── services/            # API services
│   │   ├── api.ts           # Axios instance
│   │   └── firefly.ts       # Firefly III API methods
│   ├── store/               # Zustand stores
│   ├── locales/             # i18n translations
│   └── App.tsx              # Main application component
├── Dockerfile               # Production Docker image
├── docker-compose.yml       # Docker Compose configuration
├── nginx.conf               # Nginx configuration
└── vite.config.ts           # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Configuration

### Vite Proxy

The development server is configured to proxy API requests to avoid CORS issues:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_FIREFLY_URL,
      changeOrigin: true,
    }
  }
}
```

### Nginx (Production)

For production deployments, you can configure Nginx to proxy API requests:

```nginx
location /api/ {
    proxy_pass https://your-firefly-instance.com/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Security Features

- Non-root user in Docker container
- Health checks for container monitoring
- Token-based authentication
- Secure HTTP headers via Nginx

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Firefly III](https://www.firefly-iii.org/) - The amazing personal finance manager
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Lucide](https://lucide.dev/) - For the beautiful icons
