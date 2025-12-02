FROM node:22  
WORKDIR /app/backend  
COPY backend/package*.json ./  
COPY backend/bun.lockb ./  
COPY backend/ ./  
RUN curl -fsSL https://bun.sh/install | bash  
ENV PATH="/root/.bun/bin:$PATH"  
RUN bun install  
WORKDIR /app/frontend  
COPY frontend/package*.json ./  
COPY frontend/ ./  
RUN npm install --legacy-peer-deps  
EXPOSE 3000 5173  
WORKDIR /app/backend  
CMD ["sh", "-c", "bun run start:dev & cd ../frontend && npm run dev"] 
