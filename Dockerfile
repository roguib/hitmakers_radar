# Download node image that matches with the current version on my laptop
FROM node:12.13.1

# Default directory used for any RUN, CMD, ENTRYPOINT, COPY, ADD instruction.
# Best practice, rather than doing mkdir /app and then set it as a WORKDIR
WORKDIR /usr/src/app

# Another best practice: Copying package.json and package-lock.json before copying the code
# into the container.
COPY package*.json ./

# Install npm packages
RUN npm install

COPY . .

CMD [ "npm", "start" ]