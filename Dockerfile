# Life OS Dockerfile
FROM oven/bun:1 AS base

# Install dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Set environment
ENV NODE_ENV=production
ENV DATABASE_URL=file:../db/custom.db

# Create db directory
RUN mkdir -p /app/db && touch /app/db/custom.db

# Generate Prisma client
RUN bun run db:generate

# Build the Next.js app
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["sh", "-c", "bun run db:push && bun run start"]
