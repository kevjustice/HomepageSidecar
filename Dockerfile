# Stage 1: Build Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Final Image
FROM node:20-slim
WORKDIR /app

# Copy built assets
COPY --from=frontend-build /app/frontend/dist ./public
COPY --from=backend-build /app/backend/dist ./backend
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY backend/package.json ./

# Env vars
ENV PORT=8080
ENV NODE_ENV=production
ENV CONFIG_DIR=/config

EXPOSE 8080

CMD ["node", "backend/index.js"]
