# Unified Dockerfile for all Votiix Services in the monorepo
FROM node:20-alpine AS builder

WORKDIR /app
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set build argument to know which workspace we are targeting
ARG APP_NAME

# Copy workspace config
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/${APP_NAME} ./apps/${APP_NAME}

# Install dependencies
RUN npm ci

# Generate Prisma Client (if DB package has schema)
RUN cd packages/db && npm run generate || true

# Build the specific app and its dependencies
RUN npm run build --workspace=${APP_NAME}

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ARG APP_NAME

# Copy only dist outputs and production node_modules to keep image small
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/
COPY --from=builder /app/apps/${APP_NAME}/dist ./apps/${APP_NAME}/dist

# Pass down the APP_NAME to start command
ENV START_SCRIPT="npm run start --workspace=${APP_NAME}"
CMD sh -c "$START_SCRIPT"
