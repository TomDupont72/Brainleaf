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

CMD ["node", "dist/index.js"]