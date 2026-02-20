FROM 767417401669.dkr.ecr.us-east-1.amazonaws.com/donrifa-stage/landing-page:node-newstage-24-alpine

WORKDIR /app

# DO NOT hardcode NODE_ENV here if you use ECS runtime variables
ENV PORT=6060

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Important step
RUN npm run build

EXPOSE 6060

CMD ["npm", "run", "start"]
