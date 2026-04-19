# ───────────────────────────────────────────────────
# Stage 1: Builder
# ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first for layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# ───────────────────────────────────────────────────
# Stage 2: Production Image
# ───────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the installed dependencies and source
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Use non-root user
USER appuser

# Expose API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

ENV NODE_ENV=production

CMD ["node", "server.js"]
