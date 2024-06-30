
FROM node:20-bullseye-slim AS build
# Installing libvips-dev for sharp Compatability
RUN apt-get update && apt-get install -y \
  build-essential \
  gcc \
  autoconf \
  automake \
  libtool \
  pkg-config \
  nasm \
  libvips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g && yarn install --production
WORKDIR /opt/app
COPY ./ .
RUN yarn build

FROM node:20-bullseye
RUN apt-get update && apt-get install -y libvips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY --from=build /opt/app ./
EXPOSE 1337
CMD ["yarn", "start"]
