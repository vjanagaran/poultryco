# Multi-stage build for Next.js admin app
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/admin/package.json ./apps/admin/
COPY package-lock.json* ./

# Install dependencies
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build (must be set before build)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_SKIP_PACKAGE_MANAGER_CHECK=1

# Remove packageManager field from package.json to prevent Next.js from checking
# This avoids the yarn detection issue
RUN if [ -f package.json ]; then \
      sed -i '/"packageManager"/d' package.json; \
    fi

# Build Next.js app
WORKDIR /app/apps/admin
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
# Next.js standalone output structure:
# - .next/standalone/apps/admin/ contains the server.js
# - Static files need to be at apps/admin/.next/static (relative to server.js location)
# - The standalone build already includes static files in apps/admin/.next/static
# - We also copy to root .next/static as a fallback
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/admin/server.js"]

