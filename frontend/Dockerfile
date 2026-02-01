# Multi-stage build for React frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Set npm registry for China
ENV npm_config_registry=https://registry.npmmirror.com

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Final stage with nginx
FROM nginx:alpine

# Install wget for health check
RUN apk --no-cache add ca-certificates wget

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
