# Builder stage
FROM node:18.17.0 AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Runtime stage
FROM node:18.17.0-slim

# Set working directory
WORKDIR /app

# Copy built artifacts from the builder stage
COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/scripts /app/scripts
COPY --from=builder /app/app /app/app/
COPY --from=builder /app/prisma /app/prisma/

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g npm@10.2.5

# Expose the port the app runs on
EXPOSE 8080

# Command to run the app
CMD ["npm", "start"]
