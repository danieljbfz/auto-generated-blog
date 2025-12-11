# Multi-Stage Dockerfile for Node.js + Prisma + TypeScript Backend

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files (these change far less often, so they get cached)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code and configuration files
COPY . .

# Generate Prisma Client before building the app (requires dummy DATABASE_URL)
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy?schema=public"
RUN npx prisma generate

# Build TypeScript code (output is placed in /app/dist)
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 3: Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from the builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy compiled JavaScript from the builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy package.json for metadata
COPY --chown=nodejs:nodejs package*.json ./

# Switch to the non-root user
USER nodejs

# Expose the application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]