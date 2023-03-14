FROM alpine:3.17.1

LABEL maintainer="Adam Stradovnik"

# Installs latest Chromium package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN mkdir /usr/src/app/input

# RUN npm install mammoth yargs puppeteer
# fs

ENTRYPOINT ["node", "index.js"]
CMD ["--file=example.docx"]