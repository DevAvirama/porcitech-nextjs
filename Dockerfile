# =============================================================
# ETAPA 1: Dependencias base
# =============================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install -g pnpm && \
    pnpm config set network-timeout 600000 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

# =============================================================
# ETAPA 2: Compilación de Next.js (Standalone)
# =============================================================
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

RUN pnpm run build

# =============================================================
# ETAPA 3: Runner de Producción Ultra-ligero (~120 MB)
# =============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Usuario no privilegiado para máxima seguridad en producción
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar activos estáticos públicos
COPY --from=builder /app/public ./public

# Crear directorio .next y ajustar permisos para la caché de prerenderizado
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar artefactos standalone mínimos compilados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
