FROM node:14 as builder

ADD . /app
WORKDIR /app

RUN npm install --loglevel=error
RUN npm install -g @angular/cli@10.1.7 --loglevel=error

RUN npm run ng -- build --prod --aot --outputHashing=all

ENV PATH /app/node_modules/.bin:$PATH

FROM nginx:alpine

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/reef-app-v2 /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
