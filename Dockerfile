FROM 767417401669.dkr.ecr.us-east-1.amazonaws.com/donrifa/node-monolith:node-14.20.1

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# 🔥 ENSURE NO STALE NEXT.JS FILES
RUN rm -rf .next public/_next

# Disable eslint safely
ENV NEXT_DISABLE_ESLINT=1

# Build fresh Next.js output
RUN npm run build

EXPOSE 6060

CMD ["node", "--max-old-space-size=6144", "Donrifa-web-server.js"]
