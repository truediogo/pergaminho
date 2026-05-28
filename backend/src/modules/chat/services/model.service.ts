import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ModelProvider } from '../dtos/query.dto';

export interface GenerateResponseOptions {
    provider?: ModelProvider;
    model?: string;
    apiKey?: string;
}

@Injectable()
export class ModelService {
    private readonly logger = new Logger(ModelService.name);
    private readonly ollamaUrl = process.env.MODEL_URL || process.env.OLLAMA_URL || 'http://localhost:11434';

    async generateResponse(
        query: string,
        context: string,
        onToken?: (token: string) => void,
        options: GenerateResponseOptions = {},
    ): Promise<string> {
        const provider = this.resolveProvider(options.provider);

        try {
            const prompt = this.buildPrompt(query, context);

            if (provider === 'openai') {
                return await this.generateOpenAiResponse(prompt, onToken, options);
            }

            if (provider === 'gemini') {
                return await this.generateGeminiResponse(prompt, onToken, options);
            }

            return await this.generateOllamaResponse(prompt, onToken, options);
        } catch (error) {
            this.logger.error(`Failed to generate response with ${provider}`, error);
            throw this.toClientError(provider, error);
        }
    }

    private async generateOllamaResponse(
        prompt: string,
        onToken?: (token: string) => void,
        options: GenerateResponseOptions = {},
    ): Promise<string> {
        const modelName = options.model ?? process.env.MODEL_NAME ?? 'llama3.1:8b';
        const response = await axios.post(
            `${this.ollamaUrl.replace(/\/$/, '')}/api/generate`,
            {
                model: modelName,
                prompt,
                stream: true,
            },
            {
                timeout: 0,
                responseType: 'stream',
            }
        );

        return this.consumeJsonLines(response.data, (data) => {
            const token = typeof data.response === 'string' ? data.response : '';
            if (token) {
                onToken?.(token);
                return token;
            }

            return '';
        });
    }

    private async generateOpenAiResponse(
        prompt: string,
        onToken?: (token: string) => void,
        options: GenerateResponseOptions = {},
    ): Promise<string> {
        const apiKey = this.resolveApiKey('openai', options.apiKey);
        const modelName = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-5.4-mini';

        const response = await axios.post(
            'https://api.openai.com/v1/responses',
            {
                model: modelName,
                input: prompt,
                stream: true,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 0,
                responseType: 'stream',
            },
        );

        let fullResponse = '';

        await this.consumeSse(response.data, (payload) => {
            if (payload === '[DONE]') return;

            const data = JSON.parse(payload);
            const token = data.type === 'response.output_text.delta' && typeof data.delta === 'string'
                ? data.delta
                : '';

            if (token) {
                fullResponse += token;
                onToken?.(token);
            }

            if (!fullResponse && data.type === 'response.completed') {
                const completedText = this.extractOpenAiText(data.response);
                if (completedText) {
                    fullResponse = completedText;
                }
            }
        });

        return fullResponse;
    }

    private async generateGeminiResponse(
        prompt: string,
        onToken?: (token: string) => void,
        options: GenerateResponseOptions = {},
    ): Promise<string> {
        const apiKey = this.resolveApiKey('gemini', options.apiKey);
        const modelName = (options.model ?? process.env.GEMINI_MODEL ?? 'gemini-2.5-flash').replace(/^models\//, '');
        const baseUrl = (process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');

        const response = await axios.post(
            `${baseUrl}/v1beta/models/${encodeURIComponent(modelName)}:streamGenerateContent?alt=sse`,
            {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
            },
            {
                headers: {
                    'x-goog-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 0,
                responseType: 'stream',
            },
        );

        let fullResponse = '';

        await this.consumeSse(response.data, (payload) => {
            if (payload === '[DONE]') return;

            const data = JSON.parse(payload);
            const token = data.candidates
                ?.flatMap((candidate: any) => candidate.content?.parts ?? [])
                ?.map((part: any) => part.text)
                ?.filter(Boolean)
                ?.join('') ?? '';

            if (token) {
                fullResponse += token;
                onToken?.(token);
            }
        });

        return fullResponse;
    }

    private consumeJsonLines(
        stream: NodeJS.ReadableStream,
        onData: (data: any) => string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            let buffer = '';
            let fullResponse = '';
            let settled = false;

            const finish = () => {
                if (settled) return;
                settled = true;
                resolve(fullResponse);
            };

            const processLine = (line: string) => {
                if (!line.trim() || settled) return;

                try {
                    const data = JSON.parse(line);
                    fullResponse += onData(data);

                    if (data.done) {
                        finish();
                    }
                } catch {
                    this.logger.debug(`Ignoring malformed stream line: ${line.substring(0, 120)}`);
                }
            };

            stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                lines.forEach(processLine);
            });

            stream.on('error', (error: Error) => {
                if (settled) return;
                settled = true;
                reject(error);
            });

            stream.on('end', () => {
                processLine(buffer);
                finish();
            });
        });
    }

    private consumeSse(
        stream: NodeJS.ReadableStream,
        onPayload: (payload: string) => void,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let buffer = '';

            const processEvent = (event: string) => {
                const payload = event
                    .split(/\r?\n/)
                    .filter(line => line.startsWith('data:'))
                    .map(line => line.slice(5).trimStart())
                    .join('\n')
                    .trim();

                if (!payload) return;

                try {
                    onPayload(payload);
                } catch (error) {
                    reject(error);
                }
            };

            stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString();
                const events = buffer.split(/\r?\n\r?\n/);
                buffer = events.pop() ?? '';
                events.forEach(processEvent);
            });

            stream.on('error', (error: Error) => reject(error));

            stream.on('end', () => {
                if (buffer.trim()) {
                    processEvent(buffer);
                }
                resolve();
            });
        });
    }

    private extractOpenAiText(response: any): string {
        return response?.output
            ?.flatMap((item: any) => item.content ?? [])
            ?.map((content: any) => content.text)
            ?.filter(Boolean)
            ?.join('') ?? '';
    }

    private resolveProvider(provider?: ModelProvider): ModelProvider {
        const rawProvider = provider ?? process.env.MODEL_PROVIDER;

        if (rawProvider === 'openai' || rawProvider === 'gemini' || rawProvider === 'ollama') {
            return rawProvider;
        }

        return 'ollama';
    }

    private resolveApiKey(provider: Exclude<ModelProvider, 'ollama'>, apiKey?: string): string {
        const resolvedApiKey = apiKey?.trim();

        if (!resolvedApiKey) {
            throw new Error(`Informe a API key de ${this.providerLabel(provider)} no frontend para enviar a mensagem.`);
        }

        return resolvedApiKey;
    }

    private toClientError(provider: ModelProvider, error: unknown): Error {
        if (error instanceof Error && error.message.startsWith('Informe a API key')) {
            return error;
        }

        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                return new Error(`A API key de ${this.providerLabel(provider)} foi recusada. Verifique a chave e tente novamente.`);
            }

            const providerMessage = this.extractProviderError(error.response?.data);
            return new Error(`Falha ao chamar ${this.providerLabel(provider)}${providerMessage ? `: ${providerMessage}` : '.'}`);
        }

        return new Error(`Falha ao gerar resposta com ${this.providerLabel(provider)}.`);
    }

    private extractProviderError(data: any): string {
        if (!data) return '';
        if (typeof data === 'string') return data.substring(0, 240);
        if (typeof data.error?.message === 'string') return data.error.message;
        if (typeof data.message === 'string') return data.message;
        return '';
    }

    private providerLabel(provider: ModelProvider): string {
        if (provider === 'openai') return 'OpenAI';
        if (provider === 'gemini') return 'Gemini';
        return 'Ollama';
    }

    private buildPrompt(query: string, context: string): string {
        const contextAvailable = context && context.trim().length > 0;
        
        return `Você é um assistente útil, claro e direto.

COMO RESPONDER:
- Responda em português.
- Seja simples, amigável e objetivo.
- Use Markdown somente quando ajudar (listas, passos, títulos curtos).
- Se houver documentos relevantes, use-os como base principal.
- Se os documentos não tiverem informação suficiente, diga isso brevemente e responda com conhecimento geral quando fizer sentido.
- Não finja que uma informação veio dos documentos quando ela não veio.

SE NÃO HOUVER DOCUMENTOS:
- Responda normalmente à pergunta do usuário.

${contextAvailable 
    ? `DOCUMENTOS:\n${context}` 
    : 'DOCUMENTOS: Nenhum documento disponível.'}

PERGUNTA:
${query}`;
    }
}
