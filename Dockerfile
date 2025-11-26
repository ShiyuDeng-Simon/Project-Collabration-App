# Stage 1: Build the React Client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Node Server
FROM node:18-alpine
WORKDIR /app/server

# Copy server dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy server code
COPY server/ ./

# Copy built client assets from Stage 1
COPY --from=client-build /app/client/build ../client/build

# Expose the port
EXPOSE 8000

# Set environment variables (defaults, can be overridden)
ENV PORT=8000
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]