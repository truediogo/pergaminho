# Pergaminho - Backend (Motor RAG & Banco Vetorial)

Esta pasta contém o servidor **Backend** do projeto **Pergaminho**, construído em NestJS. Ele é responsável pelo processamento de arquivos, indexação vetorial no ChromaDB, busca de contexto e integração com provedores de IA para o Assistente RAG.

Este projeto faz parte do trabalho de IA da **FATEC Mogi Mirim** sob orientação do **Prof. Diego Pires**.

---

## 🧠 Arquitetura Técnica do Motor RAG

Nosso backend é o cérebro que viabiliza o RAG (Geração Aumentada de Recuperação):

1.  **Ingestão de Arquivos (`/upload`):** Quando o frontend envia um arquivo técnico (PDF ou Word), o NestJS o recebe através do `multer`.
2.  **Parsing de Documentos:** Extraímos o texto puro do documento usando `pdf-parse` (para PDFs) ou `mammoth` (para arquivos .docx).
3.  **Fragmentação (Chunking):** O texto é segmentado em trechos menores (chunks) para preservar o contexto sem exceder a janela de contexto das IAs.
4.  **Embeddings & Banco Vetorial (ChromaDB):** Enviamos os trechos de texto para gerar representações matemáticas (vetores/embeddings) e os salvamos no **ChromaDB Cloud**, permitindo buscas semânticas rápidas.
5.  **Serviço de Mensageria (WebSocket):** O gateway de WebSockets escuta as perguntas do usuário. Ele busca os trechos semânticos mais parecidos com a pergunta no ChromaDB, monta o prompt com contexto e envia para o provedor selecionado: **Ollama**, **OpenAI** ou **Gemini**.

---

## 🛠️ Stack Tecnológica

*   **Framework:** [NestJS 10](https://nestjs.com/) (Node.js moderno com TypeScript)
*   **Banco Vetorial:** [ChromaDB](https://www.trychroma.com/) Cloud
*   **WebSockets:** NestJS Websockets com engine `socket.io`
*   **Processamento de Arquivos:** `pdf-parse` e `mammoth`
*   **Integração de Modelo:** [Ollama](https://ollama.com/), OpenAI Responses API e Gemini API

---

## 🚀 Como Executar

### Pré-requisitos

*   Node.js instalado (v18+)
*   Gerenciador de pacotes `pnpm` (ou `npm`/`yarn`)
*   Credenciais do ChromaDB configuradas.
*   Opcional: Ollama instalado localmente na sua máquina e rodando.

### Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```bash
PORT=3001
FRONTEND_URL=http://localhost:3000

CHROMA_DATABASE=seu_database
CHROMA_TENANT=seu_tenant
CHROMA_API_KEY=sua_chave_chroma

OLLAMA_URL=http://localhost:11434
MODEL_PROVIDER=ollama # ollama | openai | gemini
MODEL_NAME=llama3.1:8b
OPENAI_MODEL=gpt-5.4-mini
GEMINI_MODEL=gemini-2.5-flash
```

As API keys da OpenAI e do Gemini são informadas pela interface do frontend e enviadas ao backend junto com a mensagem. Elas não precisam ficar no `.env` do backend.

### Instalação das Dependências

```bash
pnpm install
```

### Inicializando o Servidor

```bash
# Executar em modo de desenvolvimento (atualização automática ao salvar)
pnpm run start:dev

# Executar em produção
pnpm run build
pnpm run start:prod
```

Por padrão, a API iniciará na porta **3001** e estará pronta para receber uploads na rota HTTP POST `/upload`, listar modelos do Ollama em `/ollama/models` e processar mensagens via WebSocket.

---

## 📁 Estrutura de Diretórios Importantes

*   `src/main.ts`: Arquivo de inicialização configurando CORS, porta e adaptadores.
*   `src/app.module.ts`: Módulo raiz que unifica os serviços de arquivo, socket e processamento de IA.
*   `src/modules/document/services/chromadb.service.ts`: Conexão com o ChromaDB e persistência dos chunks vetorizados.
*   `src/modules/chat/services/model.service.ts`: Integração com Ollama, OpenAI e Gemini.
*   `src/modules/chat/gateways/chat.gateway.ts`: Manipula conexões WebSocket com o frontend para resposta em streaming.
