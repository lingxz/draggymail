FROM node:7.9.0-alpine

# Set a working directory
WORKDIR /usr/src/app

COPY ./package.json .
COPY ./yarn.lock .

# Install Node.js dependencies
RUN yarn global add pm2 --no-progress
RUN yarn install --production --no-progress

# Copy application files
COPY . .
EXPOSE 3000

CMD [ "pm2-docker", "server.js" ]
