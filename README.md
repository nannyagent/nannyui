# NannyUI

NannyUI is the web-based user interface for [NannyAgent](https://github.com/nannyagent/nannyagent) - an autonomous AI-powered infrastructure management platform. It provides a modern, responsive dashboard for managing agents, investigations, patching operations, and system monitoring.

## Features

- **Dashboard**: Real-time overview of infrastructure health and agent status
- **Agent Management**: Register, monitor, and manage NannyAgent instances
- **Investigations**: AI-powered root cause analysis and issue investigation
- **Patch Management**: Automated patching with scheduling and rollback capabilities
- **Multi-Factor Authentication**: TOTP-based MFA for enhanced security
- **Dark/Light Theme**: Adaptive UI with theme support

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Backend**: PocketBase / NannyAPI
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/nannyagent/nannyui.git
cd nannyui

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_POCKETBASE_URL=http://localhost:8090
```

## Documentation

- [CI/CD & Deployment Guide](docs/CICD.md) - Build, test, and deployment pipelines
- [MFA Documentation](MFA.md) - Multi-Factor Authentication setup and API reference
- [Project Documentation](docs/README.md) - General project documentation

## Docker Deployment

You can run NannyUI using the official Docker image. This image is lightweight and can be configured with environment variables.

### Quick Start

```bash
docker run -d -p 8080:80 \
  -e VITE_POCKETBASE_URL=https://api.example.com \
  nannyagent/nannyui:latest
```

This will start the UI on http://localhost:8080.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_POCKETBASE_URL` | The URL of your PocketBase backend API | `http://127.0.0.1:8090` |

### Building Locally

To build the Docker image locally:

```bash
docker build -t nannyui .
```

### GitHub Actions

This repository is configured to automatically build and push the Docker image to Docker Hub on every push to `main` or when a new tag is pushed.

To enable this:
1. Go to your GitHub Repository Settings > Secrets and variables > Actions.
2. Add the following repository secrets:
    *   `DOCKER_USERNAME`: Your Docker Hub username.
    *   `DOCKER_PASSWORD`: Your Docker Hub access token (not password).


## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/      # React components
│   ├── ui/          # shadcn/ui base components
│   └── ...          # Feature components
├── contexts/        # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API service functions
├── integrations/    # External integrations (PocketBase)
└── utils/           # Utility functions
```

## Deployment Options

### Docker (Recommended)

See the Docker Deployment section above.

### Cloudflare Pages

The project is configured for automatic deployment to Cloudflare Pages on push to main.

### Manual Deployment

```bash
npm run build
# Deploy the contents of the `dist` folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
