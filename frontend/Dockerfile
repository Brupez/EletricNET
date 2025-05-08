FROM node:latest

WORKDIR /meal-booking-frontend

COPY package.json ./
COPY package-lock.json ./
COPY . ./

RUN npm install --frozen-lockfile

EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--port", "3000"]