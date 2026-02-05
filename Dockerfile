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

# Set environment variables for build
ENV VITE_FIREFLY_API_URL=$VITE_FIREFLY_API_URL
ENV VITE_FIREFLY_TOKEN=$VITE_FIREFLY_TOKEN
ENV VITE_FIREFLY_URL=$VITE_FIREFLY_URL

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

# Create non-root user for nginx (security best practice)
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
