# Multi-stage Dockerfile for Node.js Acquisitions App
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Development stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage with dev dependencies
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Development stage
FROM base AS development
COPY --chown=nodejs:nodejs --from=dev-deps /usr/src/app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

USER nodejs
EXPOSE 3000
ENV NODE_ENV=development

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS build
COPY --from=dev-deps /usr/src/app/node_modules ./node_modules
COPY . .

# Generate Drizzle migrations if needed
RUN npm run db:generate

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Copy built assets from build stage
COPY --from=build --chown=nodejs:nodejs /usr/src/app/drizzle ./drizzle

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]