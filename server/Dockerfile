FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY supabase ./supabase
ENV NODE_ENV=production
EXPOSE 8787
CMD ["npm", "run", "start:server"]
