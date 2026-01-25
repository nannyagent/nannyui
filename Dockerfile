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

# Stage 2: Serve with a simple HS server
FROM node:20-alpine

WORKDIR /app

# Install 'serve' package
RUN npm install -g serve

# Copy built assets
COPY --from=builder /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]
