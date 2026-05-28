import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ProcessQueryUseCase } from '../usecases/process-query.usecase';
import { QueryDto } from '../dtos/query.dto';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ChatGateway.name);

    constructor(private readonly processQueryUseCase: ProcessQueryUseCase) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: QueryDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.log(`Received message from ${client.id}: ${data.message}`);
            const provider = data.provider || 'ollama';

            client.emit('botTyping', true);

            const chatResponse = await this.processQueryUseCase.execute(
                data.message,
                data.sessionId || client.id,
                (token: string) => {
                    client.emit('messageToken', {
                        sessionId: data.sessionId,
                        token,
                        provider,
                        model: data.model,
                        timestamp: new Date(),
                    });
                },
                {
                    provider,
                    model: data.model,
                    apiKey: data.apiKey,
                },
            );

            client.emit('messageComplete', {
                sessionId: data.sessionId,
                timestamp: new Date(),
                relevantChunks: chatResponse.usedContext ? chatResponse.relevantChunks : [],
                message: chatResponse.message,
                provider,
                model: data.model,
                usedContext: chatResponse.usedContext
            });

            client.emit('botTyping', false);

        } catch (error) {
            this.logger.error('Error processing message', error);

            client.emit('error', {
                message: error instanceof Error
                    ? error.message
                    : 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
                timestamp: new Date(),
            });

            client.emit('botTyping', false);
        }
    }
}
