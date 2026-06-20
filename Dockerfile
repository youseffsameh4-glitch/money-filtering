# Use Debian-based slim image (Alpine causes Prisma OpenSSL issues)
FROM node:20-slim

# Install OpenSSL (required by Prisma's query engine)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Push schema to the database then start the server
CMD ["sh", "-c", "npx prisma db push && node server.js"]