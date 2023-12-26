FROM node:18.16.1

WORKDIR ./

COPY package.json .

RUN npm install --production

COPY ./build ./build

ENV PORT=4000

CMD [ "npm","start" ]