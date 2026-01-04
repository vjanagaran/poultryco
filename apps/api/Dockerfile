# apps/api/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY package-lock.json* ./

# Install dependencies using npm (as specified in package.json)
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the API
RUN npm run build --workspace=apps/api

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install Chromium and required dependencies for Puppeteer in Alpine
# These are needed for whatsapp-web.js to work in Docker
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    && rm -rf /var/cache/apk/*

# Set Chromium path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/package-lock.json* ./

# Copy all node_modules from builder (includes all dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Ensure uuid and other API dependencies are available at root level
# (npm workspaces may not hoist all dependencies)
RUN npm install uuid@^9.0.1 --no-save --legacy-peer-deps || true

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist

# Create session directory with proper permissions
RUN mkdir -p /app/whatsapp-sessions && \
    chown -R nestjs:nodejs /app/whatsapp-sessions && \
    chmod -R 755 /app/whatsapp-sessions

USER nestjs

EXPOSE 3002

# Use production start command
CMD ["node", "dist/main.js"]