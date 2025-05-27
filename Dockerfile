# pull official base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./

# 安装必要的包
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# 生成自签名证书
RUN mkdir -p /app/certs && \
    openssl genrsa -out /app/certs/key.pem 2048 && \
    openssl req -new -x509 -key /app/certs/key.pem -out /app/certs/cert.pem -days 365 -subj "/CN=localhost" && \
    chmod 600 /app/certs/key.pem && \
    chmod 644 /app/certs/cert.pem

RUN npm install

# switch user
USER node

# add app
COPY . ./

# 只暴露443端口
EXPOSE 443

# Environment variables
ENV MQTT_BROKER_URL=
ENV MQTT_BROKER_USER_NAME=apikey
ENV MQTT_BROKER_PASSWORD=
ENV MQTT_BROKER_PATH=/ws
ENV MQTT_BROKER_PORT=443
ENV MQTT_BROKER_DISABLE_SLL=false

ENV WATSON_STT_USERNAME=apikey
ENV WATSON_STT_PASSWORD=jg-XuAmf0OCndcR2oE_TyMhJdlmkqr5ODFL_p96d5Kf4
ENV WATSON_STT_URL=https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/98ab317e-d22b-4635-8973-315a81ad33f9
ENV WATSON_STT_MODEL=en-US_Telephony
ENV WATSON_STT_END_OF_PHRASE_SILENCE_TIME=1.3

# 设置端口为443
ENV DEFAULT_SERVER_LISTEN_PORT=80
ENV STREAM_CONNECTOR_API_KEY=
ENV STREAM_ADAPTER_TYPE=GenesysAudioHookAdapter
ENV LOG_LEVEL=debug

# 启用SSL
ENV SSL_ENABLED=true
ENV SSL_CERT_PATH=/app/certs/cert.pem
ENV SSL_KEY_PATH=/app/certs/key.pem

# start app
CMD ["npm", "start"]
