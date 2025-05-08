# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built code from build stage
COPY --from=build /app/dist ./dist

# Copy other necessary files
COPY .env.example ./
COPY migrations ./migrations

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]
