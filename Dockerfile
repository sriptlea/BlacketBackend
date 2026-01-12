FROM oven/bun:latest
WORKDIR /app

# Copy everything
COPY . ./

# Install root
RUN bun install --no-save

# Build types first (no dependencies on other blacket packages)
WORKDIR /app/packages/types
RUN bun install --no-save
RUN bun run build
RUN bun link

# Build common (depends on types)
WORKDIR /app/packages/common
RUN bun install --no-save
RUN bun link @blacket/types
RUN bun run build
RUN bun link

# Build core (depends on types)
WORKDIR /app/packages/core
RUN bun install --no-save
RUN bun link @blacket/types
RUN bun run build 2>/dev/null || true
RUN bun link

# Build mail-templates (depends on types)
WORKDIR /app/packages/mail-templates
RUN bun install --no-save
RUN bun link @blacket/types
RUN bun run build 2>/dev/null || true
RUN bun link

# Backend - link all packages and install
WORKDIR /app/backend
RUN bun install --no-save
RUN bun link @blacket/types @blacket/common @blacket/core @blacket/mail-templates

# Build Nest backend
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start:prod"]
