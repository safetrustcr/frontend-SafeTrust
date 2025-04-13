# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Install Python, build tools, and development packages for the usb package
RUN apk add --no-cache python3 build-base linux-headers eudev-dev libusb-dev
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY eslint.config.mjs ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./
COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install runtime dependencies for usb
RUN apk add --no-cache libusb eudev
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/next.config.ts ./next.config.ts
USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]