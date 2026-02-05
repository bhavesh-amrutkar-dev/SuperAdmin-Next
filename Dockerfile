# ---------- Base ----------
FROM public.ecr.aws/docker/library/node:24-alpine

WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Production ----------
FROM public.ecr.aws/docker/library/node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6060

# Required runtime files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.* ./

# 🔥 FIX: correct path for next-intl messages
COPY --from=builder /app/src ./src

EXPOSE 6060
CMD ["npm", "start"]
