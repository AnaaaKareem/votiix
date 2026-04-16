FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/votiix-token ./apps/votiix-token

RUN npm ci
RUN cd packages/db && npm run generate || true

# Build shared packages
RUN npm run build --workspace=@votiix/db
RUN npm run build --workspace=@votiix/utils
# Build the application
RUN npm run build --workspace=votiix-token

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/votiix-token/package.json ./apps/votiix-token/
COPY --from=builder /app/apps/votiix-token/dist ./apps/votiix-token/dist

CMD ["npm", "run", "start", "--workspace=votiix-token"]
