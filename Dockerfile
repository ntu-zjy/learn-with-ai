FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
ENV SEALOS=1
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
ENV STATIC_DIR=/app/dist
ENV DATA_DIR=/data

COPY --from=builder /app/docs/.vitepress/dist /app/dist
COPY server /app/server

VOLUME ["/data"]

EXPOSE 80
CMD ["node", "server/index.mjs"]
