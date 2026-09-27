FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3344

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY public ./public
COPY assets ./assets
COPY data/questions.json ./data/questions.json

RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3344

CMD ["npm", "start"]
