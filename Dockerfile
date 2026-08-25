FROM node:18-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "NODE_ENV=production npm run build && NODE_ENV=production npx next start -H 0.0.0.0 -p 3000"]
