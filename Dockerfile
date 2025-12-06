# Use official lightweight Node image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first for cached installs
COPY package*.json ./

RUN npm ci --only=production

# Copy source
COPY . .

# Expose port
ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server/index.js"]
