import { Injectable, Logger } from '@nestjs/common';
import { ChromaDbService } from '../../document/services/chromadb.service';
import { GenerateResponseOptions, ModelService } from '../services/model.service';
import { ChatResponse } from '../entities/chat-response.entity';

@Injectable()
export class ProcessQueryUseCase {
    private readonly logger = new Logger(ProcessQueryUseCase.name);

    private readonly greetingPatterns = [
        /^(oi|olá|opa|e aí|e ai|hey|opa|tudo bem|como vai|como está|você está|ta tudo bem|beleza|opa)/i,
        /^(meu nome|meu nick|me chama|meu apelido)/i,
        /^(qual seu nome|qual é seu nome|como você se chama|quem é você|o que você é|você é um bot|você é um assistente)/i,
        /^(me conte|conte uma|uma piada|faça uma piada|me faz rir|faz uma graça)/i,
        /^(obrigad|brigad|valeu|muito bem|parabéns|legal|show)/i,
        /^(até|falou|tchau|bye|adeus)/i,
        /^(não sei|nã sei|nem sei|sem ideia)/i,
    ];

    constructor(
        private readonly vectorStore: ChromaDbService,
        private readonly modelService: ModelService,
    ) { }

    private isSimpleQuery(query: string): boolean {
        const lowerQuery = query.trim().toLowerCase();
        
        if (lowerQuery.length < 3) {
            return true;
        }

        for (const pattern of this.greetingPatterns) {
            if (pattern.test(lowerQuery)) {
                return true;
            }
        }

        return false;
    }

    private getChunksToFetch(query: string): number {
        return this.isSimpleQuery(query) ? 0 : 5;
    }

    async execute(
        query: string,
        sessionId: string,
        onToken?: (token: string) => void,
        modelOptions?: GenerateResponseOptions,
    ): Promise<ChatResponse> {
        try {
            this.logger.log(`Processing query for session ${sessionId}: ${query.substring(0, 100)}...`);

            const chunksToFetch = this.getChunksToFetch(query);
            const isSimple = chunksToFetch === 0;

            this.logger.log(`Query type: ${isSimple ? 'SIMPLE/CHAT' : 'DOCUMENT'} - Fetching ${chunksToFetch} chunks`);

            const relevantChunks = chunksToFetch > 0 
                ? await this.vectorStore.similaritySearch(query, chunksToFetch)
                : [];

            this.logger.log(`Found ${relevantChunks.length} relevant chunks`);

            const context = relevantChunks
                .map(chunk => chunk.content)
                .join('\n\n');

            let fullResponse = '';

            const response = await this.modelService.generateResponse(
                query,
                context,
                (token: string) => {
                    fullResponse += token;
                    onToken?.(token);
                },
                modelOptions,
            );

            const chatResponse = new ChatResponse(
                this.generateId(),
                response || fullResponse,
                relevantChunks.length > 0 ? relevantChunks : [],
                new Date(),
                true,
                relevantChunks.length > 0
            );

            this.logger.log(`Generated response for session ${sessionId}`);

            return chatResponse;
        } catch (error) {
            this.logger.error('Failed to process query', error);
            throw error;
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
