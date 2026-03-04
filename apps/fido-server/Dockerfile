FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/fido-server/package.json ./apps/fido-server/

# Install all deps
RUN npm install --workspace=apps/fido-server --workspace=packages/shared

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/fido-server/ ./apps/fido-server/

# Build shared types
RUN npm run build -w packages/shared

EXPOSE 3001

CMD ["npx", "-w", "apps/fido-server", "tsx", "src/index.ts"]
