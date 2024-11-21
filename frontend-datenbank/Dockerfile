# Use the official Node.js image to build the app
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock if you're using Yarn)
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application files
COPY . ./

# Expose the port the app will run on
EXPOSE 3000

# Start the React development server
CMD ["npm", "run", "dev"]
