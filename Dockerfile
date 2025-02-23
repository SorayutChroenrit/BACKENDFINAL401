# Use the official Node.js image as a base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the local project files into the container
COPY . .

# Install dependencies
RUN yarn install

# Build the Next.js app for production
RUN yarn build

# Start the application
CMD ["yarn", "start"]
