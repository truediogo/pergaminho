'use client'

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useSelectedModel } from '@/contexts/modelContext';
import { Header } from './Header';

const providerModels = {
    openai: [
        { model: 'gpt-5.4-mini', name: 'GPT-5.4 mini' },
        { model: 'gpt-5.5', name: 'GPT-5.5' },
        { model: 'gpt-5.4-nano', name: 'GPT-5.4 nano' },
        { model: 'chat-latest', name: 'Chat latest' },
    ],
    gemini: [
        { model: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { model: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { model: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
        { model: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
    ],
};

export const HeaderWrapper = () => {
    const [ollamaModels, setOllamaModels] = useState<{ model: string; name: string }[]>([]);
    const [ollamaStatus, setOllamaStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
    const {
        selectedProvider,
        setSelectedProvider,
        selectedModel,
        setSelectedModel,
        apiKey,
        setApiKey,
    } = useSelectedModel();
    const { isConnected } = useSocket();

    useEffect(() => {
        if (selectedProvider !== 'ollama') return;

        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const fetchModels = async () => {
            setOllamaStatus('loading');

            try {
                const res = await fetch(`${base}/ollama/models/`);
                if (!res.ok) throw new Error('Erro ao buscar modelos');
                const data: { model: string; name: string }[] = await res.json();
                setOllamaModels(data);
                setOllamaStatus(data.length > 0 ? 'ready' : 'unavailable');

                if (data.length > 0 && !selectedModel) {
                    setSelectedModel(data[0].model);
                }

                if (data.length === 0) {
                    setSelectedModel('');
                }
            } catch (err) {
                setOllamaModels([]);
                setOllamaStatus('unavailable');
                setSelectedModel('');
            }
        };

        fetchModels();
    }, [selectedModel, selectedProvider, setSelectedModel]);

    const models = selectedProvider === 'ollama'
        ? ollamaModels
        : providerModels[selectedProvider];

    const providerStatus = selectedProvider === 'ollama'
        ? ollamaStatus
        : apiKey.trim()
            ? 'ready'
            : 'missing-key';

    const providerStatusText = selectedProvider === 'ollama'
        ? ollamaStatus === 'loading'
            ? 'Buscando Ollama'
            : ollamaStatus === 'ready'
                ? 'Ollama pronto'
                : 'Ollama indisponível'
        : apiKey.trim()
            ? `${selectedProvider === 'openai' ? 'OpenAI' : 'Gemini'} pronto`
            : 'API key necessária';

    return (
        <Header
            models={models}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            isConnected={isConnected}
            status={providerStatus}
            statusText={providerStatusText}
        />
    );
};
