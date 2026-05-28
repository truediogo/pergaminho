# Pergaminho - Frontend (Interface Gráfica & Cliente)

Esta pasta contém a aplicação **Frontend** do projeto **Pergaminho**, desenvolvida em Next.js para fornecer uma interface gráfica moderna, responsiva e em tempo real para upload de documentos e interação com o Assistente de Inteligência Artificial.

Este projeto faz parte do trabalho de IA da **FATEC Mogi Mirim** sob orientação do **Prof. Diego Pires**.

---

## 🌟 Recursos Principais

*   **💬 Chat em Tempo Real:** Conexão contínua com o backend via WebSockets (`Socket.IO`), permitindo fluxo de mensagens dinâmico (streaming) e interações instantâneas.
*   **🗂️ Histórico Local:** Múltiplas conversas salvas no `localStorage`, com criação, alternância e exclusão de conversas.
*   **📄 Upload Inteligente:** Interface estilo arrastar-e-soltar (Drag & Drop) com suporte a arquivos PDF e DOCX para processamento na base de conhecimento.
*   **🎨 Design Moderno:** Visual minimalista inspirado no Messenger com suporte nativo a temas **Claro (Light)** e **Escuro (Dark)**.
*   **🔌 Integração com Modelos:** Modal de configuração para selecionar Ollama, OpenAI ou Gemini, escolher o modelo e informar API key quando necessário.

---

## 🛠️ Stack Tecnológica

*   **Framework:** [Next.js 16](https://nextjs.org/) (com React 19)
*   **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) para componentes de acessibilidade
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Comunicação Bidirecional:** [Socket.IO Client](https://socket.io/)
*   **Consumo de API:** [Axios](https://axios-http.com/)

---

## 🚀 Como Executar

### Pré-requisitos

*   Node.js instalado (v18+)
*   Gerenciador de pacotes `pnpm` (ou `npm`/`yarn`)
*   O **Pergaminho Backend** rodando na porta `3001` (veja as instruções na pasta `../backend`).

### Instalação das Dependências

```bash
pnpm install
```

### Configuração de Ambiente

Crie ou certifique-se de que existe um arquivo `.env.local` contendo a URL da API do backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Modelos e API Keys

O seletor de modelos fica em um modal acessado pelo botão de configurações no header.

*   **Ollama:** usa os modelos listados pelo backend em `/ollama/models`.
*   **OpenAI:** exige API key digitada na interface.
*   **Gemini:** exige API key digitada na interface.

As chaves digitadas na interface são salvas no `localStorage` do navegador e enviadas ao backend apenas ao enviar mensagens.

### Histórico de Chat

O histórico é local ao navegador:

*   Desktop: sidebar lateral com lista de conversas.
*   Mobile: seletor compacto acima do chat.
*   Cada conversa recebe título automático a partir da primeira mensagem.
*   O histórico pode ser apagado pela interface excluindo conversas ou limpando o `localStorage` do navegador.

### Execução em Desenvolvimento

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para interagir com o app.

---

## 📁 Estrutura de Diretórios Importantes

*   `src/app/chat/`: Estrutura da página do Chatbot, contendo histórico local, sidebar de conversas, balões de mensagens e área de entrada de texto.
*   `src/app/upload/`: Área de upload do documento com drag-and-drop e feedbacks visuais de processamento.
*   `src/components/`: Componentes globais como o header principal e o modal de configuração de modelos de IA.
*   `src/hooks/useSocket.ts`: Gerenciamento do ciclo de vida e envio de mensagens via WebSockets.
*   `src/contexts/modelContext.tsx`: Contexto React para provedor/modelo/API key escolhidos.
*   `src/contexts/themeContext.tsx`: Contexto React para troca de temas escuro/claro.
