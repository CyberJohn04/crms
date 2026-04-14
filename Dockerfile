# Stage 1: Build React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY src ./src
COPY public ./public
COPY scripts ./scripts

# Build React app
RUN npm run build

# Stage 2: Production image with Express server
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm install --legacy-peer-deps --production

# Copy server code
COPY server ./server

# Copy docker startup wrapper
COPY docker-start.js ./

# Copy built React app from builder stage
COPY --from=builder /app/build ./build

# Copy public folder for db.json and other static assets
COPY public ./public

# Set environment variables
ENV NODE_ENV=production
ENV SERVER_PORT=5000
ENV CLIENT_ORIGIN=http://localhost:3001

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000 || exit 1

# Start server with static file serving
CMD ["node", "docker-start.js"]
