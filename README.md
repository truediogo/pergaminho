# Pergaminho - Assistente Inteligente de Q&A sobre Documentos (RAG)

Trabalho prático desenvolvido para a disciplina de **Inteligência Artificial (IA)** na **FATEC Mogi Mirim**, sob orientação do **Prof. Diego Pires**.

O **Pergaminho** é uma aplicação Fullstack de IA Generativa que implementa o conceito de **RAG (Retrieval-Augmented Generation)**. Ele permite que usuários façam upload de documentos complexos (como PDFs técnicos e relatórios em Word) e conversem diretamente com o conteúdo usando modelos de IA locais ou APIs externas em tempo real.

---

## 🎓 Contexto Acadêmico

*   **Instituição:** Faculdade de Tecnologia de Mogi Mirim (FATEC Mogi Mirim)
*   **Disciplina:** Inteligência Artificial
*   **Orientador:** Prof. Diego Pires
*   **Tema do Projeto:** IA Generativa e RAG Básica/Avançada (Correspondente aos projetos 7 e 12 da lista de sugestões da disciplina)

---

## 🧠 Como Funciona o Projeto (Arquitetura RAG)

O RAG (Geração Aumentada de Recuperação) resolve o problema de alucinação e limitação de conhecimento das IAs genéricas. Nosso fluxo funciona assim:

1.  **Leitura do Documento:** O usuário envia um documento técnico (PDF/DOCX) pelo frontend.
2.  **Processamento e Extração:** O backend extrai o texto bruto do arquivo.
3.  **Fragmentação (Chunking):** O texto é quebrado em pequenos pedaços estruturados para facilitar a pesquisa sem estourar o limite de tokens da IA.
4.  **Vetorização (Embeddings):** Cada fragmento de texto é transformado em um vetor numérico (vetorizado).
5.  **Banco de Dados Vetorial:** Salvamos esses vetores em um banco de dados especialista chamado **ChromaDB**.
6.  **Recuperação e Resposta (Chat):** Quando o usuário faz uma pergunta no chat, o sistema faz busca semântica no ChromaDB, resgata os trechos mais relevantes do documento original e injeta esse contexto no modelo selecionado (**Ollama**, **OpenAI** ou **Gemini**).
7.  **Histórico Local:** As conversas ficam salvas no navegador via `localStorage`, permitindo criar, alternar e excluir conversas sem depender de banco relacional.

---

## 📁 Estrutura do Monorepo (pnpm Workspaces)

O projeto está organizado no formato de **Monorepo Real** utilizando **pnpm workspaces**. Isso significa que todas as dependências do frontend e backend são resolvidas juntas em um único arquivo de trava na raiz (`pnpm-lock.yaml`), facilitando a instalação e execução:

```
pergaminho/ (Monorepo)
├── package.json          # Configuração global de scripts da workspace
├── pnpm-workspace.yaml   # Declaração dos subprojetos
├── pnpm-lock.yaml        # Lockfile unificado das dependências
├── Dockerfile            # Containerização completa de ambos os serviços
├── frontend/             # Interface em React / Next.js (Porta 3000)
│   ├── package.json      # Dependências do frontend (@pergaminho/frontend)
│   └── README.md         # Documentação específica do frontend
└── backend/              # API e Motor RAG em NestJS / Node.js (Porta 3001)
    ├── package.json      # Dependências do backend (@pergaminho/backend)
    └── README.md         # Documentação específica do backend
```

---

## 🛠️ Stack Tecnológica

*   **Interface:** Next.js (React 19), Tailwind CSS v4 e componentes acessíveis com Radix UI.
*   **Servidor Backend:** NestJS (Framework progressivo em Node.js com TypeScript).
*   **Banco Vetorial:** ChromaDB Cloud para armazenamento e busca vetorial dos chunks.
*   **Comunicação:** WebSockets via Socket.IO para entrega de mensagens via streaming em tempo real.
*   **Processamento de Linguagem Natural (LLM):** Ollama local, OpenAI ou Gemini, selecionáveis pela interface.
*   **Histórico do Chat:** `localStorage` no frontend.

---

## 🚀 Como Executar o Trabalho (Localmente)

### Requisitos

1.  Node.js instalado (v18+)
2.  Gerenciador de pacotes **pnpm** instalado globalmente:
    ```bash
    npm install -g pnpm
    ```
3.  Conta/projeto no ChromaDB com credenciais de API.
4.  Opcional: [Ollama](https://ollama.com/) instalado e rodando com o modelo de sua escolha (ex: `llama3`, `mistral`, `gemma`) caso queira usar o provedor local.

### Configuração de Ambiente

Crie o arquivo `backend/.env` com as credenciais do backend:

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

Crie o arquivo `frontend/.env.local` se precisar apontar para outro backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Inicializando Tudo com Um Único Comando

Graças à estrutura de workspaces do pnpm, você não precisa abrir múltiplos terminais para rodar o projeto. Abra um único terminal na pasta raiz e execute:

1.  **Instalar dependências de todo o projeto:**
    ```bash
    pnpm install
    ```
2.  **Iniciar o Frontend e o Backend em paralelo:**
    ```bash
    pnpm dev
    ```

*   O **Frontend (Next.js)** estará acessível em **http://localhost:3000**.
*   O **Backend (NestJS)** estará rodando na porta **3001**.
*   Certifique-se de que as credenciais do ChromaDB estão configuradas no `backend/.env`.
*   Se usar Ollama, certifique-se de que ele está rodando na sua máquina.

### Provedores de IA

No topo do chat, abra as configurações de modelo para selecionar o provedor desejado:

*   **Ollama:** usa o serviço local em `http://localhost:11434`.
*   **OpenAI:** informe a chave no campo de API key da interface.
*   **Gemini:** informe a chave no campo de API key da interface.

As chaves da OpenAI/Gemini são digitadas no frontend, ficam salvas apenas no `localStorage` do navegador e são enviadas ao backend somente no momento da geração da resposta. Evite usar essas chaves em computadores compartilhados.

### Histórico de Conversas

O chat suporta múltiplas conversas:

*   Criar nova conversa.
*   Alternar entre conversas pela sidebar no desktop ou seletor no mobile.
*   Excluir conversas.
*   Salvar histórico localmente no navegador via `localStorage`.

Esse histórico não é sincronizado entre navegadores/dispositivos e não é salvo no backend.

---

## 🐳 Como Executar com Docker (Único Container)

Você pode empacotar todo o monorepo (frontend + backend) dentro de um único container Docker.

### 1. Construir a imagem Docker:
Na raiz do monorepo, rode:
```bash
docker build -t pergaminho-app .
```

### 2. Executar o container:
Para rodar o container expondo as duas portas, carregando as credenciais do backend e permitindo comunicação com o Ollama local no seu computador (host):
```bash
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  --env-file backend/.env \
  --add-host=host.docker.internal:host-gateway \
  --name pergaminho-instancia \
  pergaminho-app
```

> [!NOTE]
> O parâmetro `--env-file backend/.env` injeta as credenciais do ChromaDB no backend. O parâmetro `--add-host=host.docker.internal:host-gateway` permite que o backend dentro do container Docker se comunique com o Ollama rodando localmente na sua máquina (`host.docker.internal:11434`).

*   Acesse o chat pelo navegador em: **http://localhost:3000**
*   A API estará respondendo em: **http://localhost:3001**

---

## 📜 Licença

Trabalho acadêmico desenvolvido para fins didáticos. Distribuído sob a licença GPL.
