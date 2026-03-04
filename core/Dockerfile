# Production Dockerfile for NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy apple and google assets (assuming they are copied into core/ before build)
# Alternatively, use root context. For now, we'll assume they are in /app/apple and /app/google
COPY apple ./apple
COPY google ./google

EXPOSE 3000

# CMD ["npm", "run", "start:prod"]
# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
