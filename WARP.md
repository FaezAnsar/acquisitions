# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Quick Start

```bash
# Development with Docker (recommended)
export $(grep -v '^#' .env.development | xargs)
docker-compose -f docker-compose.dev.yml up --build

# Alternative: npm scripts
npm run dev:docker  # Uses scripts/dev.sh
npm run prod:docker # Uses scripts/prod.sh
```

### Core Development Tasks

```bash
# Local development (requires Node.js 20+)
npm install
npm run dev        # Start with hot reload

# Code quality
npm run lint       # Check code style
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format code with Prettier
npm run format:check # Check formatting

# Database operations
npm run db:generate # Generate Drizzle migrations
npm run db:migrate  # Apply migrations
npm run db:studio   # Open Drizzle Studio UI

# Production
npm start          # Production server
```

### Docker Commands

```bash
# Development environment (Neon Local + hot reload)
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Production environment (Neon Cloud)
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml down

# Database operations in containers
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Environment Management

```bash
# Load development environment variables
export $(grep -v '^#' .env.development | xargs)

# Required environment files
.env.development  # Template for development
.env.production   # Template for production
.env.dev.local    # Your actual dev credentials (gitignored)
.env.prod.local   # Your actual prod credentials (gitignored)
```

## Architecture Overview

### Technology Stack

- **Runtime**: Node.js 20+ with ES modules
- **Framework**: Express.js with modern middleware stack
- **Database**: PostgreSQL via Neon (Local for dev, Cloud for prod)
- **ORM**: Drizzle with PostgreSQL adapter
- **Security**: Arcjet for rate limiting, bot detection, and shield protection
- **Containerization**: Multi-stage Docker builds with development/production targets

### Database Architecture

- **Development**: Uses Neon Local proxy with ephemeral database branches that auto-delete on container stop
- **Production**: Direct connection to Neon Cloud Database
- **Migrations**: Managed by Drizzle Kit with automatic schema generation
- **Connection**: Neon Serverless Driver with environment-specific configuration

### Application Structure

```
src/
├── app.js              # Express app configuration and middleware setup
├── index.js            # Entry point (loads env and starts server)
├── server.js           # HTTP server setup
├── config/
│   ├── arcjet.js       # Security configuration
│   ├── database.js     # Neon DB connection with env-specific config
│   └── logger.js       # Winston logging setup
├── controllers/        # Route handlers
├── middlewares/        # Custom middleware (security, etc.)
├── models/            # Drizzle schema definitions
├── routes/            # Express route definitions
├── services/          # Business logic layer
├── utils/             # Helper functions (JWT, cookies, formatting)
└── validations/       # Input validation schemas
```

### Security Layer

- **Arcjet Integration**: Role-based rate limiting (admin: 20/min, user: 10/min, guest: 5/min)
- **Bot Detection**: Automatic bot request blocking
- **Shield Protection**: Attack pattern detection and blocking
- **Helmet**: Security headers for production
- **CORS**: Cross-origin request handling

### Development vs Production Differences

- **Database**: Ephemeral branches (dev) vs persistent cloud DB (prod)
- **Hot Reload**: Enabled in development via file watching
- **Logging**: Development logs to console, production uses Winston
- **Security**: Relaxed CORS in development, strict in production
- **Resource Limits**: Docker containers have memory/CPU limits in production

### Key Configuration Files

- `drizzle.config.js`: Database schema and migration configuration
- `eslint.config.js`: Code style rules with modern ES6+ standards
- `Dockerfile`: Multi-stage build with development and production targets
- `docker-compose.dev.yml`: Development stack with Neon Local
- `docker-compose.prod.yml`: Production deployment configuration

### Import System

Uses Node.js subpath imports for clean module resolution:

- `#config/*` → `./src/config/*.js`
- `#controllers/*` → `./src/controllers/*.js`
- `#models/*` → `./src/models/*.js`
- `#services/*` → `./src/services/*.js`
- `#middlewares/*` → `./src/middlewares/*.js`
- `#utils/*` → `./src/utils/*.js`
- `#routes/*` → `./src/routes/*.js`
- `#validations/*` → `./src/validations/*.js`

### Environment Variables Requirements

Development requires:

- `NEON_API_KEY`: Neon account API key
- `NEON_PROJECT_ID`: Neon project identifier
- `PARENT_BRANCH_ID`: Base branch for ephemeral branches
- `ARCJET_KEY`: Security service API key

Production requires:

- `DATABASE_URL`: Full PostgreSQL connection string to Neon Cloud
- `ARCJET_KEY`: Production security service key
- `NODE_ENV=production`
