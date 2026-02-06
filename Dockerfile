# Use your ECR image as the base
FROM 767417401669.dkr.ecr.us-east-1.amazonaws.com/donrifa-stage/landing-page:latest

WORKDIR /app

# Set environment variables
ENV NODE_ENV=development
ENV PORT=6060

# Copy package files and install dependencies 
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port
EXPOSE 6060

# Start the app
CMD ["npm", "run", "dev", "--", "-p", "6060"]
