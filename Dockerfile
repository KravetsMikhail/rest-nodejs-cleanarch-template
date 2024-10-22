#FROM node:14

#
#WORKDIR /app
#COPY . /app

#
#RUN rm -rf node_modules \
#  && echo >> .npmrc && echo "@bpm:registry=http://10.174.18.94:8081/repository/npm-bpm/" >> .npmrc \
#  && echo >> .yarnrc && echo '"@bpm:registry" "http://10.174.18.94:8081/repository/npm-bpm/"' >> .yarnrc \
# && yarn global add prisma@2.17.0  \
#  && npm install \
#  && yarn add @bpm/bpm-utils@0.0.5 \
#  && cat package.json \
#  && yarn install \
# && chown -R node /app

#
#ENV HOME_DIR=/app

#
#EXPOSE 7788

# run
#CMD chmod a+x ./run_in_docker.sh && /bin/bash ./run_in_docker.sh

# .......Development Stage.......
FROM node:20.18.0 as development
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./
# Upgrade npm to the latest version globally
RUN npm install -g npm@latest
# Install project dependencies
RUN npm install
# Install ts-node globally for running TypeScript code
RUN npm install -g ts-node
# Copy the entire application code into the container
COPY . .
# Build the application 
RUN npm run build

# .......Production Stage.......
FROM node:20.18.0 as production
# Define an argument for the Node environment 
# with a default value of "production"
ARG NODE_ENV=production
# Set the environment variable for the Node environment
ENV NODE_ENV=${NODE_ENV}
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./
# Install only production dependencies
RUN npm install --only=production
# Copy the entire application code into the container
COPY . .
# Copy the build artifacts from the development stage to the production stage
COPY --from=development /app/dist ./dist
# Default command to run when the container starts in production mode
CMD npm run prod