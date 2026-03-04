FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/wl-bank/package.json ./apps/wl-bank/

RUN npm install --workspace=apps/wl-bank

COPY apps/wl-bank/ ./apps/wl-bank/

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build -w apps/wl-bank

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/apps/wl-bank/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
