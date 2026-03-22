FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "process.exit(0)"

CMD ["node", "dist/index.js"]