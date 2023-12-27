FROM zenika/alpine-chrome:with-node

WORKDIR ./

COPY package.json .
COPY --chown=chrome package.json ./

RUN npm install --production

COPY --chown=chrome . ./
COPY ./build ./build

ENV PORT=4000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

CMD [ "npm","start" ]