FROM node:24-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/src ./src
COPY assets /assets
RUN mkdir -p /app/data
EXPOSE 4000
CMD ["npm", "start"]
