FROM node:22.13.1-alpine as build

WORKDIR /usr/src/app

COPY package.json ./

RUN rm -rf package-lock.json

RUN npm i

COPY . .
RUN npm run build
# RUN mv /usr/src/app/dist/build/images /usr/src/app/dist/

FROM nginx:alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8002