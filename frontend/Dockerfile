FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
RUN if [ -n "$VITE_API_URL" ]; then \
      npm run build; \
    else \
      unset VITE_API_URL && npm run build; \
    fi

FROM nginx:alpine

ARG NGINX_CONF=nginx.conf

COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80