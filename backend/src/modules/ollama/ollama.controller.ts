import { Controller, Get } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ollama')
export class OllamaController {
    constructor(private readonly ollamaService: OllamaService) { }

    @Get('models')
    async listModels() {
        const models = await this.ollamaService.listModels();
        return models;
    }
}
