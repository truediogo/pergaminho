'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type ModelProvider = 'ollama' | 'openai' | 'gemini';

type ApiProvider = Exclude<ModelProvider, 'ollama'>;

const DEFAULT_MODELS: Record<ModelProvider, string> = {
    ollama: '',
    openai: 'gpt-5.4-mini',
    gemini: 'gemini-2.5-flash',
};

const STORAGE_KEY = 'retriever:model-settings';

interface ModelContextType {
    selectedProvider: ModelProvider;
    setSelectedProvider: (provider: ModelProvider) => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    apiKey: string;
    setApiKey: (apiKey: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedProvider, setSelectedProviderState] = useState<ModelProvider>('ollama');
    const [selectedModels, setSelectedModels] = useState<Record<ModelProvider, string>>(DEFAULT_MODELS);
    const [apiKeys, setApiKeys] = useState<Record<ApiProvider, string>>({
        openai: '',
        gemini: '',
    });
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                setHydrated(true);
                return;
            }

            const parsed = JSON.parse(saved) as {
                selectedProvider?: ModelProvider;
                selectedModels?: Partial<Record<ModelProvider, string>>;
                apiKeys?: Partial<Record<ApiProvider, string>>;
            };

            if (parsed.selectedProvider && ['ollama', 'openai', 'gemini'].includes(parsed.selectedProvider)) {
                setSelectedProviderState(parsed.selectedProvider);
            }

            setSelectedModels({
                ...DEFAULT_MODELS,
                ...parsed.selectedModels,
            });

            setApiKeys({
                openai: parsed.apiKeys?.openai ?? '',
                gemini: parsed.apiKeys?.gemini ?? '',
            });
        } catch {
            setSelectedProviderState('ollama');
            setSelectedModels(DEFAULT_MODELS);
            setApiKeys({ openai: '', gemini: '' });
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            selectedProvider,
            selectedModels,
            apiKeys,
        }));
    }, [apiKeys, hydrated, selectedModels, selectedProvider]);

    const selectedModel = selectedModels[selectedProvider] ?? DEFAULT_MODELS[selectedProvider];

    const setSelectedProvider = useCallback((provider: ModelProvider) => {
        setSelectedProviderState(provider);
    }, []);

    const setSelectedModel = useCallback((model: string) => {
        setSelectedModels(prev => ({
            ...prev,
            [selectedProvider]: model,
        }));
    }, [selectedProvider]);

    const apiKey = selectedProvider === 'ollama' ? '' : apiKeys[selectedProvider];

    const setApiKey = useCallback((apiKeyValue: string) => {
        if (selectedProvider === 'ollama') return;

        setApiKeys(prev => ({
            ...prev,
            [selectedProvider]: apiKeyValue,
        }));
    }, [selectedProvider]);

    const value = useMemo(() => ({
        selectedProvider,
        setSelectedProvider,
        selectedModel,
        setSelectedModel,
        apiKey,
        setApiKey,
    }), [apiKey, selectedModel, selectedProvider, setApiKey, setSelectedModel, setSelectedProvider]);

    return (
        <ModelContext.Provider value={value}>
            {children}
        </ModelContext.Provider>
    );
};

export const useSelectedModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useSelectedModel must be used within a ModelProvider');
    }
    return context;
};
