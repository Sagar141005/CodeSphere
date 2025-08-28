# --- Dependencies layer ---
FROM base AS deps
RUN npm ci

# --- Build layer ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production image ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only needed files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY package*.json ./

RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]