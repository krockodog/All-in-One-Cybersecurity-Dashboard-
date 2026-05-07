# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder — install deps and build client + server
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies (including devDeps for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build: Vite client bundle + esbuild server bundle
RUN pnpm build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production image — minimal runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy only what's needed for runtime
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Runtime environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the production server
CMD ["node", "dist/index.js"]
