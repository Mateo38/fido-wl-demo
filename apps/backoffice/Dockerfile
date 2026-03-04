FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backoffice/package.json ./apps/backoffice/

RUN npm install --workspace=apps/backoffice

COPY apps/backoffice/ ./apps/backoffice/

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build -w apps/backoffice

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/apps/backoffice/dist ./dist
EXPOSE 5174
CMD ["serve", "-s", "dist", "-l", "5174"]
