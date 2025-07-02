#Use an official Node.js runtime as a base image
FROM node:18

#Set working directory inside the container
WORKDIR /app

#Copy package.json and package-lock.json
COPY package*.json ./

#Install app dependencies
RUN npm install

#Copy the rest of the application code
COPY . .

#Expose the port app runs on
EXPOSE 3000

#Start the app (use nodemon in dev, but for container use node)
CMD ["node", "src/server.mjs"]
