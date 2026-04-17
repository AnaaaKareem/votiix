FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/votiix-identity ./apps/votiix-identity

RUN npm install
RUN cd packages/db && npm run generate || true

# Build shared packages
RUN npm run build --workspace=@votiix/db
RUN npm run build --workspace=@votiix/utils
# Build the application
RUN npm run build --workspace=votiix-identity

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/votiix-identity/package.json ./apps/votiix-identity/
COPY --from=builder /app/apps/votiix-identity/dist ./apps/votiix-identity/dist

CMD ["npm", "run", "start", "--workspace=votiix-identity"]
