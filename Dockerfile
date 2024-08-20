FROM node:22-alpine as builder 
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine as production
WORKDIR /app
COPY package.json ./
RUN npm install
COPY --from=builder app/dist/ ./dist/
COPY --from=builder app/node_modules/.prisma/client/ ./node_modules/.prisma/client/
COPY ./src/telegram/markdowns/ ./dist/telegram/markdowns/
COPY ./prisma ./prisma/
CMD ["npm", "run", "start:prod"]
