FROM oven/bun:latest AS builder
WORKDIR /app

# Copy everything
COPY . ./

# Install root
RUN bun install --no-save

# Build types first
WORKDIR /app/packages/types
RUN bun install --no-save
RUN bun run build
RUN bun link

# Build common
WORKDIR /app/packages/common
RUN bun install --no-save
RUN bun link @blacket/types
RUN bun run build
RUN bun link

# Build core
WORKDIR /app/packages/core
RUN bun install --no-save
RUN bun link @blacket/types
RUN bun run build 2>/dev/null || true
RUN bun link

# Build mail-templates
WORKDIR /app/packages/mail-templates
RUN bun install --no-save
RUN bun link @blacket/types
RUN bun run build 2>/dev/null || true
RUN bun link

# Build backend
WORKDIR /app/backend
RUN bun install --no-save
RUN bun link @blacket/types @blacket/common @blacket/core @blacket/mail-templates
RUN bun run build

# Production stage
FROM oven/bun:latest
WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

EXPOSE 3000
CMD ["bun", "run", "start:prod"]
