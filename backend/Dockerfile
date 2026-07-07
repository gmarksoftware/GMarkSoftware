FROM node:20-alpine

WORKDIR /app

# Copy dependency configs
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Generate Prisma client for SQLite
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Start Express server
CMD ["npm", "start"]
