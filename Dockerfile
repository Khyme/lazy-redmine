# build stage
FROM node:lts-alpine as base
RUN mkdir -p /app/front
RUN mkdir -p /app/back

# ---- Build ----
FROM base AS build-stage

WORKDIR /app
COPY . .

WORKDIR /app/front
RUN npm install && npm rebuild node-sass && npm run build

WORKDIR /app/back
RUN npm install --only=production

# ---- Release ----
FROM base AS release

LABEL description="Let you fill redmine timesheet automatically by daterange"

COPY --from=build-stage /app/front/dist /app/front/dist
COPY --from=build-stage /app/back /app/back

WORKDIR /app/back
USER node
EXPOSE 3000

CMD ["npm", "run", "start"]
