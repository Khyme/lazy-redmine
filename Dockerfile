# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY ./front/package*.json ./front/
RUN cd front && npm install
COPY ./front ./front/
RUN cd front && npm run build
COPY ./back/package*.json ./back/
RUN cd back && npm install
COPY ./back ./back/
WORKDIR /app/back

EXPOSE 3000
CMD ["npm", "run", "start"]