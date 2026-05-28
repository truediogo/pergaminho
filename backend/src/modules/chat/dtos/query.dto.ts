import { IsIn, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export type ModelProvider = 'ollama' | 'openai' | 'gemini';

export class QueryDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    sessionId: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsIn(['ollama', 'openai', 'gemini'])
    provider?: ModelProvider;

    @IsOptional()
    @IsString()
    apiKey?: string;
}
