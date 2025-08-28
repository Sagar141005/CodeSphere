# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Dependencies layer ---
FROM base AS deps
RUN npm install --frozen-lockfile

# --- Build layer ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production image ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only what’s needed
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]