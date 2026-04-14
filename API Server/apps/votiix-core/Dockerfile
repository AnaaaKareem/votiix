FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/votiix-core ./apps/votiix-core

RUN npm ci
RUN cd packages/db && npm run generate || true

# Build shared packages
RUN npm run build --workspace=@votiix/db
RUN npm run build --workspace=@votiix/utils
# Build the application
RUN npm run build --workspace=votiix-core

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/votiix-core/package.json ./apps/votiix-core/
COPY --from=builder /app/apps/votiix-core/dist ./apps/votiix-core/dist

CMD ["npm", "run", "start", "--workspace=votiix-core"]
