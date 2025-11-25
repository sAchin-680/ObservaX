# Simple Node.js Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev
CMD ["npm", "start"]
