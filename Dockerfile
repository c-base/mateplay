FROM node:carbon-alpine
RUN apk add --update ffmpeg bash vim
RUN apk add --no-cache python3 && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    if [[ ! -e /usr/bin/python ]]; then ln -sf /usr/bin/python3 /usr/bin/python; fi && \
    rm -r /root/.cache
RUN apk add --no-cache py-numpy
WORKDIR /mateplay
COPY . .
RUN npm install
EXPOSE 8080
EXPOSE 10042/udp
CMD [ "node", "bin/server.js" ]
