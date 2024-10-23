# BUILDER
FROM node:20.18.0 AS builder
# Set the working directory in the container
WORKDIR /app
# Copy the entire application code into the container
COPY . .
# Upgrade npm to the latest version globally
RUN npm install -g npm@latest \
# Install project dependencies
&& npm install \
# Install ts-node globally for running TypeScript code
&& npm install -g ts-node \
# Build the application 
&& npm run build

# PRODUCTION
FROM node:slim

ENV NODE_ENV production
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY --chmod=755 run_in_docker.sh ./

RUN npm ci --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 1234

CMD /bin/bash ./run_in_docker.sh
# CMD chmod a+x ./run_in_docker.sh && /bin/bash ./run_in_docker.sh
# CMD [ "node", "dist/index.js" ]