import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ProcessQueryUseCase } from './usecases/process-query.usecase';
import { ModelService } from './services/model.service';
import { DocumentModule } from '../document/document.module';

@Module({
    imports: [DocumentModule],
    providers: [ChatGateway, ProcessQueryUseCase, ModelService],
})
export class ChatModule { }