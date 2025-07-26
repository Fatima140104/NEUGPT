FROM node:22.17.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"] 