# Acquisitions API

A Node.js/Express API application with Neon Database integration, designed to work seamlessly in both development and production environments.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local proxy with ephemeral database branches for isolated development
- **Production**: Connects directly to Neon Cloud Database for production workloads
- **Framework**: Node.js with Express, Drizzle ORM, and Neon Serverless Driver
- **Database**: PostgreSQL via Neon (Local for dev, Cloud for prod)

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development without Docker)
- Neon account and project ([Get started here](https://neon.tech))

## 🔧 Environment Setup

### 1. Get Your Neon Credentials

1. Sign up at [Neon.tech](https://neon.tech)
2. Create a new project
3. Get your API credentials:
   - `NEON_API_KEY`: From your Neon account settings
   - `NEON_PROJECT_ID`: From your project dashboard
   - `PARENT_BRANCH_ID`: Usually `main` or your primary branch ID
   - `DATABASE_URL`: Your production connection string

### 2. Configure Environment Variables

Copy and update the environment files:

```bash
# Copy development environment template
cp .env.development .env.dev.local

# Copy production environment template  
cp .env.production .env.prod.local
```

Update `.env.dev.local` with your Neon credentials:
```bash
NEON_API_KEY=your_actual_neon_api_key
NEON_PROJECT_ID=your_actual_project_id
PARENT_BRANCH_ID=your_parent_branch_id
ARCJET_KEY=your_arcjet_key
```

Update `.env.prod.local` with your production values:
```bash
DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
ARCJET_KEY=your_production_arcjet_key
```

## 🚀 Development Setup

### Option 1: Docker Development (Recommended)

Run the application with Neon Local for isolated development:

```bash
# Load environment variables and start development stack
export $(grep -v '^#' .env.dev.local | xargs)
docker-compose -f docker-compose.dev.yml up --build
```

This will:
- ✅ Start Neon Local proxy (creates ephemeral database branch)
- ✅ Build and run your application
- ✅ Enable hot reloading for development
- ✅ Automatically connect to the ephemeral database

**Access your application:**
- API: http://localhost:3000
- Health check: http://localhost:3000/health
- Database: `postgres://neon:npg@localhost:5432/neondb?sslmode=require`

### Option 2: Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Load environment variables
export $(grep -v '^#' .env.dev.local | xargs)

# Start Neon Local in Docker (database only)
docker run --name neon-local -p 5432:5432 \
  -e NEON_API_KEY=$NEON_API_KEY \
  -e NEON_PROJECT_ID=$NEON_PROJECT_ID \
  -e PARENT_BRANCH_ID=$PARENT_BRANCH_ID \
  neondatabase/neon_local:latest

# In another terminal, start the app
npm run dev
```

### Database Operations

```bash
# Generate Drizzle migrations
docker-compose -f docker-compose.dev.yml exec acquisitions-app npm run db:generate

# Run migrations
docker-compose -f docker-compose.dev.yml exec acquisitions-app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec acquisitions-app npm run db:studio
```

## 🚢 Production Deployment

### Option 1: Docker Production

```bash
# Set production environment variables
export DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
export ARCJET_KEY="your_production_arcjet_key"

# Deploy production stack
docker-compose -f docker-compose.prod.yml up --build -d
```

### Option 2: Platform Deployment (Heroku, Railway, etc.)

1. **Set environment variables in your platform:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ARCJET_KEY=your_production_arcjet_key
   PORT=3000
   LogLevel=info
   ```

2. **Deploy using platform-specific commands:**
   ```bash
   # Example for Railway
   railway up
   
   # Example for Heroku
   git push heroku main
   ```

### Option 3: Kubernetes Deployment

Create Kubernetes secrets and deployments:

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: acquisitions-secrets
type: Opaque
stringData:
  database-url: "postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
  arcjet-key: "your_production_arcjet_key"
```

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
```

## 📊 Database Management

### Development Database Lifecycle

- **Start**: Creates a fresh ephemeral branch from your parent branch
- **Development**: All changes are isolated to your ephemeral branch  
- **Stop**: Automatically deletes the ephemeral branch (no cleanup needed!)

### Production Database

- **Migrations**: Run `npm run db:migrate` in production
- **Backup**: Managed automatically by Neon
- **Scaling**: Handled by Neon's serverless architecture

## 🛠️ Development Workflow

1. **Start Development Environment**
   ```bash
   export $(grep -v '^#' .env.dev.local | xargs)
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Make Your Changes**
   - Edit code (hot reload enabled)
   - Update database schema in `src/models/`
   - Generate migrations: `npm run db:generate`

3. **Test Your Changes**
   ```bash
   # Check health
   curl http://localhost:3000/health
   
   # Test your API endpoints
   curl http://localhost:3000/api
   ```

4. **Clean Up**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```
   The ephemeral database branch is automatically deleted!

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if Neon Local is running
docker-compose -f docker-compose.dev.yml ps

# Check logs
docker-compose -f docker-compose.dev.yml logs neon-local
```

**Environment Variables Not Loading**
```bash
# Verify environment variables are set
export $(grep -v '^#' .env.dev.local | xargs)
env | grep NEON
```

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Stop conflicting services
docker-compose -f docker-compose.dev.yml down
```

### Logs and Debugging

```bash
# View application logs
docker-compose -f docker-compose.dev.yml logs -f acquisitions-app

# View database proxy logs  
docker-compose -f docker-compose.dev.yml logs -f neon-local

# Enter application container for debugging
docker-compose -f docker-compose.dev.yml exec acquisitions-app sh
```

## 🔐 Security Notes

- Never commit real credentials to version control
- Use environment variables for all sensitive data
- The `.env.development` and `.env.production` files contain templates only
- Create `.env.*.local` files for actual credentials (these are gitignored)

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Start development environment: `docker-compose -f docker-compose.dev.yml up`
4. Make your changes and test
5. Commit changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

---

Made with ❤️ using [Neon Database](https://neon.tech)
