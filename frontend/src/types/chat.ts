export interface ChunkMetadata {
    documentId: string;
    chunkIndex: number;
    pageNumber?: number;
    wordCount: number;
    filename: string;
}

export interface DocumentChunk {
    id: string;
    content: string;
    metadata: ChunkMetadata;
}

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isError?: boolean;
    provider?: string;
    model?: string;
    relevantChunks?: DocumentChunk[];
    sources?: string[];
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
