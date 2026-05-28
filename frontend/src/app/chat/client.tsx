'use client'

import { Conversation, Message } from '@/types/chat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { CleanChatContainer } from './components/cleanChatContainer';
import { CleanChatInput } from './components/cleanChatInput';
import { useTheme } from '@/contexts/themeContext';
import { useSelectedModel } from '@/contexts/modelContext';
import { getColors } from '@/shared/utils';
import { MessageSquareText, Plus, Trash2 } from 'lucide-react';

const CONVERSATIONS_STORAGE_KEY = 'retriever:chat-conversations';
const ACTIVE_CONVERSATION_STORAGE_KEY = 'retriever:active-conversation';

const createId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const createConversation = (): Conversation => {
    const now = new Date();

    return {
        id: createId(),
        title: 'Nova conversa',
        messages: [],
        createdAt: now,
        updatedAt: now,
    };
};

const createTitle = (content: string) => {
    const title = content.replace(/\s+/g, ' ').trim();
    return title.length > 48 ? `${title.slice(0, 45)}...` : title || 'Nova conversa';
};

const parseConversations = (value: string | null): Conversation[] => {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value) as Array<Omit<Conversation, 'createdAt' | 'updatedAt' | 'messages'> & {
            createdAt: string;
            updatedAt: string;
            messages: Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
        }>;

        if (!Array.isArray(parsed)) return [];

        return parsed.map((conversation) => ({
            ...conversation,
            createdAt: new Date(conversation.createdAt),
            updatedAt: new Date(conversation.updatedAt),
            messages: (conversation.messages ?? []).map((message) => ({
                ...message,
                timestamp: new Date(message.timestamp),
            })),
        }));
    } catch {
        return [];
    }
};

const formatConversationTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    });
};

const ChatPage = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState('');
    const [hydrated, setHydrated] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [currentResponseConversationId, setCurrentResponseConversationId] = useState('');
    const { socket, isConnected, sendQuery } = useSocket();
    const { selectedProvider, selectedModel, apiKey } = useSelectedModel();
    const { theme } = useTheme();
    const needsApiKey = selectedProvider !== 'ollama' && !apiKey.trim();
    const needsModel = !selectedModel;
    const activeConversationIdRef = useRef('');
    const currentResponseRef = useRef('');
    const pendingConversationIdRef = useRef('');

    useEffect(() => {
        const savedConversations = parseConversations(localStorage.getItem(CONVERSATIONS_STORAGE_KEY));
        const initialConversations = savedConversations.length > 0 ? savedConversations : [createConversation()];
        const savedActiveId = localStorage.getItem(ACTIVE_CONVERSATION_STORAGE_KEY);
        const initialActiveId = savedActiveId && initialConversations.some(conversation => conversation.id === savedActiveId)
            ? savedActiveId
            : initialConversations[0].id;

        setConversations(initialConversations);
        setActiveConversationId(initialActiveId);
        setHydrated(true);
    }, []);

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        currentResponseRef.current = currentResponse;
    }, [currentResponse]);

    useEffect(() => {
        if (!hydrated) return;

        localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
        localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, activeConversationId);
    }, [activeConversationId, conversations, hydrated]);

    const activeConversation = useMemo(() => {
        return conversations.find(conversation => conversation.id === activeConversationId) ?? conversations[0];
    }, [activeConversationId, conversations]);

    const sortedConversations = useMemo(() => {
        return [...conversations].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }, [conversations]);

    const appendMessage = useCallback((conversationId: string, message: Message) => {
        setConversations(prev => prev.map((conversation) => {
            if (conversation.id !== conversationId) return conversation;

            const isFirstUserMessage = message.sender === 'user'
                && conversation.messages.length === 0
                && conversation.title === 'Nova conversa';

            return {
                ...conversation,
                title: isFirstUserMessage ? createTitle(message.content) : conversation.title,
                messages: [...conversation.messages, message],
                updatedAt: new Date(),
            };
        }));
    }, []);

    const startNewConversation = () => {
        const conversation = createConversation();
        setConversations(prev => [conversation, ...prev]);
        setActiveConversationId(conversation.id);
    };

    const deleteConversation = (conversationId: string) => {
        const remainingConversations = conversations.filter(conversation => conversation.id !== conversationId);
        const nextConversations = remainingConversations.length > 0 ? remainingConversations : [createConversation()];

        setConversations(nextConversations);

        if (conversationId === activeConversationId || !nextConversations.some(conversation => conversation.id === activeConversationId)) {
            setActiveConversationId(nextConversations[0].id);
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('messageToken', (data: { token: string; timestamp: Date; sessionId: string; model?: string; provider?: string }) => {
            currentResponseRef.current += data.token;
            setCurrentResponse(currentResponseRef.current);
        });

        socket.on('messageComplete', (data: { message?: string; timestamp: Date; sessionId: string; model?: string; provider?: string; relevantChunks?: any[]; usedContext?: boolean }) => {
            const finalMessage = currentResponseRef.current || data.message || '';
            const conversationId = pendingConversationIdRef.current || activeConversationIdRef.current;

            const sources = data.usedContext && data.relevantChunks && data.relevantChunks.length > 0
                ? Array.from(new Set(data.relevantChunks.map(chunk => chunk.metadata?.filename).filter(Boolean)))
                : [];

            if (finalMessage && conversationId) {
                appendMessage(conversationId, {
                    id: createId(),
                    content: finalMessage,
                    sender: 'bot',
                    timestamp: new Date(),
                    provider: data.provider || selectedProvider,
                    model: data.model || selectedModel || undefined,
                    relevantChunks: data.usedContext ? data.relevantChunks : undefined,
                    sources: sources as string[],
                });
            }

            currentResponseRef.current = '';
            pendingConversationIdRef.current = '';
            setCurrentResponse('');
            setCurrentResponseConversationId('');
            setIsTyping(false);
        });

        socket.on('botTyping', (typing: boolean) => {
            setIsTyping(typing);
            if (typing) {
                currentResponseRef.current = '';
                setCurrentResponse('');
            }
        });

        socket.on('error', (data: { message: string }) => {
            const conversationId = pendingConversationIdRef.current || activeConversationIdRef.current;

            if (conversationId) {
                appendMessage(conversationId, {
                    id: createId(),
                    content: data.message,
                    sender: 'bot',
                    timestamp: new Date(),
                    isError: true,
                });
            }

            currentResponseRef.current = '';
            pendingConversationIdRef.current = '';
            setIsTyping(false);
            setCurrentResponse('');
            setCurrentResponseConversationId('');
        });

        return () => {
            socket.off('messageToken');
            socket.off('messageComplete');
            socket.off('botTyping');
            socket.off('error');
        };
    }, [appendMessage, selectedModel, selectedProvider, socket]);

    const sendMessage = (content: string) => {
        if (!activeConversation || !isConnected || needsApiKey || needsModel) return;

        const userMessage: Message = {
            id: createId(),
            content,
            sender: 'user',
            timestamp: new Date(),
        };

        appendMessage(activeConversation.id, userMessage);
        currentResponseRef.current = '';
        pendingConversationIdRef.current = activeConversation.id;
        setCurrentResponse('');
        setCurrentResponseConversationId(activeConversation.id);
        sendQuery?.(content, {
            provider: selectedProvider,
            model: selectedModel || undefined,
            apiKey: selectedProvider === 'ollama' ? undefined : apiKey,
            sessionId: activeConversation.id,
        });
    };

    const colors = getColors(theme);
    const activeMessages = activeConversation?.messages ?? [];
    const activeIsTyping = isTyping && currentResponseConversationId === activeConversation?.id;
    const activeCurrentResponse = currentResponseConversationId === activeConversation?.id ? currentResponse : '';

    if (!hydrated) {
        return (
            <div
                style={{ backgroundColor: colors.bg }}
                className="h-full"
            />
        );
    }

    return (
        <div
            style={{ backgroundColor: colors.bg }}
            className="flex h-full min-h-0"
        >
            <aside
                style={{
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                }}
                className="hidden w-72 shrink-0 border-r md:flex md:flex-col"
            >
                <div className="border-b px-4 py-4" style={{ borderColor: colors.border }}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <MessageSquareText size={18} />
                            <span>Conversas</span>
                        </div>
                        <button
                            type="button"
                            onClick={startNewConversation}
                            style={{
                                backgroundColor: colors.userMessageBg,
                                color: colors.userMessageText,
                            }}
                            className="rounded-md p-2 transition-opacity hover:opacity-90"
                            title="Nova conversa"
                            aria-label="Nova conversa"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <p style={{ color: colors.textTertiary }} className="text-xs">
                        Histórico salvo neste navegador.
                    </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    {sortedConversations.map((conversation) => {
                        const isActive = conversation.id === activeConversation?.id;

                        return (
                            <div
                                key={conversation.id}
                                style={{
                                    backgroundColor: isActive ? colors.borderLight : 'transparent',
                                    borderColor: isActive ? colors.border : 'transparent',
                                    color: colors.text,
                                }}
                                className="group mb-1 flex w-full items-center gap-2 rounded-md border px-2 py-1.5 transition-colors hover:opacity-90"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveConversationId(conversation.id)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <div className="truncate text-sm font-medium">{conversation.title}</div>
                                    <div style={{ color: colors.textTertiary }} className="text-xs">
                                        {formatConversationTime(conversation.updatedAt)}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteConversation(conversation.id);
                                    }}
                                    style={{ color: colors.textTertiary }}
                                    className="rounded p-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                                    title="Excluir conversa"
                                    aria-label="Excluir conversa"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col">
                <div
                    style={{
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                    }}
                    className="border-b px-4 py-3 md:hidden"
                >
                    <div className="flex items-center gap-2">
                        <select
                            value={activeConversation?.id}
                            onChange={(event) => setActiveConversationId(event.target.value)}
                            style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                                color: colors.text,
                            }}
                            className="h-10 min-w-0 flex-1 rounded-md border px-3 text-sm"
                            aria-label="Selecionar conversa"
                        >
                            {sortedConversations.map((conversation) => (
                                <option key={conversation.id} value={conversation.id}>
                                    {conversation.title}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={startNewConversation}
                            style={{
                                backgroundColor: colors.userMessageBg,
                                color: colors.userMessageText,
                            }}
                            className="rounded-md p-3"
                            title="Nova conversa"
                            aria-label="Nova conversa"
                        >
                            <Plus size={16} />
                        </button>

                        {activeConversation && (
                            <button
                                type="button"
                                onClick={() => deleteConversation(activeConversation.id)}
                                style={{
                                    borderColor: colors.border,
                                    color: colors.text,
                                }}
                                className="rounded-md border p-3"
                                title="Excluir conversa"
                                aria-label="Excluir conversa"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <CleanChatContainer
                    messages={activeMessages}
                    isTyping={activeIsTyping}
                    currentResponse={activeCurrentResponse}
                />

                <CleanChatInput
                    onSendMessage={sendMessage}
                    disabled={!isConnected || isTyping || needsApiKey || needsModel}
                    disabledPlaceholder={
                        needsApiKey
                            ? 'Informe a API key nas configurações do modelo.'
                            : needsModel
                                ? 'Modelo indisponível ou não configurado.'
                                : undefined
                    }
                />
            </section>
        </div>
    );
};

export default ChatPage;
