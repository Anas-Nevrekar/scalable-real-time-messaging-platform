# Use Node.js LTS
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]