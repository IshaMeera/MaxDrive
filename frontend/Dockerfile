#Dockerfile

#1. use official node image
FROM node:18

#2. set working directory
WORKDIR /app

#3. copy package.json and package-lock.json file
COPY package*.json ./

#4. install dependencies
RUN npm install

#5. copy rest of the code
COPY . .

#6. Expose port
EXPOSE 5173

#7. Start the app
CMD ["npm", "run", "dev", "--", "--host"]