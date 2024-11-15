# Dockerfile for the frontend service

FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install additional FontAwesome dependency
RUN npm install @fortawesome/fontawesome-svg-core --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the default React development port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
