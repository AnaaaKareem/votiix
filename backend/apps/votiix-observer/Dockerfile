FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/votiix-observer ./apps/votiix-observer

RUN npm install
RUN cd packages/db && npm run generate || true

# Build shared packages
RUN npm run build --workspace=@votiix/db
RUN npm run build --workspace=@votiix/utils
# Build the application
RUN npm run build --workspace=votiix-observer

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/votiix-observer/package.json ./apps/votiix-observer/
COPY --from=builder /app/apps/votiix-observer/dist ./apps/votiix-observer/dist

CMD ["npm", "run", "start", "--workspace=votiix-observer"]
