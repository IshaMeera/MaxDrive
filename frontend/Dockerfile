#Dockerfile frontend

#stage 1: build
FROM node:18      AS build

#set working directory
WORKDIR /app

#copy package.json and package-lock.json file
COPY package*.json ./

#install dependencies
RUN npm install

#copy rest of the code
COPY . .
RUN npm run build 

#stage 2: server with nginx
FROM nginx:alpine

#copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

#copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

#6. Expose port
EXPOSE 80

#7. Start the app
CMD ["nginx", "-g", "daemon off;"]