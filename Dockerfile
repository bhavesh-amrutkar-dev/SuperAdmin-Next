FROM 767417401669.dkr.ecr.us-east-1.amazonaws.com/donrifa-stage/landing-page:node-newstage-24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6060

# install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy source
COPY . .

# clean previous build
RUN rm -rf .next

# build nextjs app
RUN npm run build

EXPOSE 6060

# start production server
CMD ["npm","start","--","-p","6060"]
