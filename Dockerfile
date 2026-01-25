# Stage 1: Build the application
FROM node:20-alpine as builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache bash curl git

COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

COPY . .

# Run the build (including docs:fetch)
RUN npm run build

# Stage 2: Serve with nginx and environment variable injection
FROM nginx:alpine

# Copy built assets to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
