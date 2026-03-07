# Build stage
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/services ./services
COPY --from=build /app/types.ts ./

# Add tsx to run the TypeScript server
RUN npm install -g tsx

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["tsx", "server.ts"]
