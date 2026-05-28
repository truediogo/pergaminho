import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
    private readonly logger = new Logger(OllamaService.name);
    private readonly baseUrl = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');

    async listModels(): Promise<{ model: string, name: string }[]> {
        try {
            const res = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3000 }).then(res => res.data);

            const mappedModels = res.models.map(model => ({ name: model.name, model: model.model }))

            return mappedModels;
        } catch (err) {
            this.logger.warn(`Failed to fetch Ollama models from ${this.baseUrl}`, err?.message || err);
            return [];
        }
    }
}
