# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies with clean install for reproducible builds
RUN npm ci --only=production=false

# Build arguments for environment variables (can be overridden at build time)
ARG VITE_FIREFLY_API_URL=/api/v1
ARG VITE_FIREFLY_TOKEN=""
ARG VITE_FIREFLY_URL=""
ARG VITE_FIREBASE_API_KEY=""
ARG VITE_FIREBASE_AUTH_DOMAIN=""
ARG VITE_FIREBASE_PROJECT_ID=""
ARG VITE_FIREBASE_STORAGE_BUCKET=""
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=""
ARG VITE_FIREBASE_APP_ID=""

# Set environment variables for build
ENV VITE_FIREFLY_API_URL=$VITE_FIREFLY_API_URL
ENV VITE_FIREFLY_TOKEN=$VITE_FIREFLY_TOKEN
ENV VITE_FIREFLY_URL=$VITE_FIREFLY_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Copy source code (excluding .env via .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Add labels for better image management
LABEL maintainer="buenokevin200@example.com"
LABEL description="Firefly III Frontend - Personal Finance Management"
LABEL version="1.0.0"

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions for non-root execution
# 1. Use /tmp/nginx.pid instead of /run/nginx.pid
# 2. Ensure all necessary directories are writable by the nginx user
# 3. Remove the 'user' and 'pid' directives from the main nginx.conf as they conflict with non-root config
RUN sed -i 's/^user/#user/' /etc/nginx/nginx.conf && \
    sed -i 's/^pid/#pid/' /etc/nginx/nginx.conf && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /tmp/nginx.pid && \
    chown nginx:nginx /tmp/nginx.pid

# Switch to the existing nginx user
USER nginx

# Expose port 3000 (non-privileged port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start nginx with custom PID location
CMD ["nginx", "-g", "daemon off; pid /tmp/nginx.pid;"]
