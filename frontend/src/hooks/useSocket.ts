import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ModelProvider } from '@/contexts/modelContext';

interface SendQueryOptions {
    provider?: ModelProvider;
    model?: string;
    apiKey?: string;
    sessionId?: string;
}

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const socketInstance = io(base, {
            path: '/socket.io',
            transports: ['websocket'],
            withCredentials: true,
        });

        socketInstance.on('connect', () => {
            console.log('Connected to server', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, []);

    const sendQuery = useCallback((message: string, options: SendQueryOptions = {}) => {
        if (!socket || !isConnected) return;

        socket.emit('sendMessage', {
            message,
            sessionId: options.sessionId || socket.id,
            provider: options.provider,
            model: options.model,
            apiKey: options.apiKey,
        });
    }, [socket, isConnected]);

    return { socket, isConnected, sendQuery };
};
