# ── Stage 1: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/client/package.json ./packages/client/package.json
RUN npm pkg delete scripts.prepare && npm ci

COPY packages/api/ ./packages/api/
RUN npm run build -w packages/api

# ── Stage 2: runtime ──────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/client/package.json ./packages/client/package.json
RUN npm pkg delete scripts.prepare && npm ci --omit=dev

COPY --from=builder /app/packages/api/dist ./packages/api/dist

WORKDIR /app/packages/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/src/app.js"]
