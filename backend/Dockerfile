# Backend Dockerfile for Express & Prisma
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Automatically deploy Prisma schema migrations seamlessly into DB before node startup
# We use a subshell to log errors but continue to server start to avoid "silent" container hangs
CMD echo "🚀 Starting Backend Services..." && \
    (npx prisma migrate deploy || { echo "❌ Prisma Migration Failed!"; exit 1; }) && \
    echo "✅ Database Migrations Applied" && \
    npm run start
