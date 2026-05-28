FROM node:20-slim

# Instala o pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copia os arquivos de configuração do monorepo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copia os arquivos package.json dos projetos para cache de dependências
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Instala todas as dependências do workspace de forma otimizada
RUN pnpm install

# Copia todo o código fonte do monorepo
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Constrói o frontend e o backend
RUN pnpm build

# Expõe as portas (3000 = Frontend, 3001 = Backend)
EXPOSE 3000 3001

# Comando padrão que executa ambos os serviços em paralelo
CMD ["pnpm", "dev"]
