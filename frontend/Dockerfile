# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# Receive API URL from Render
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build React/Vite app
RUN npm run build


# ---------- Production stage ----------
FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Configure nginx for Render
RUN printf 'server {\n\
    listen 10000;\n\
    server_name _;\n\
\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy React build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]