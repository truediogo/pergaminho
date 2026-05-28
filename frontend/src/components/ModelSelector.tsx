'use client'

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { ModelProvider } from '@/contexts/modelContext';
import { useTheme } from '@/contexts/themeContext';
import { getColors } from '@/shared/utils';
import { Eye, EyeOff, KeyRound, Settings2, X } from 'lucide-react';

interface ModelSelectorProps {
  models: { model: string; name: string }[];
  selectedProvider: ModelProvider;
  onProviderChange: (provider: ModelProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  isConnected: boolean;
  status: 'ready' | 'loading' | 'unavailable' | 'missing-key';
  statusText: string;
}

const providers: { value: ModelProvider; label: string }[] = [
  { value: 'ollama', label: 'Ollama' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  apiKey,
  onApiKeyChange,
  isConnected,
  status,
  statusText,
}) => {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const needsApiKey = selectedProvider !== 'ollama';
  const currentProvider = providers.find(provider => provider.value === selectedProvider);
  const statusColor = status === 'ready'
    ? '#22c55e'
    : status === 'loading'
      ? '#f59e0b'
      : '#ef4444';
  const modelSelectDisabled = !isConnected || status === 'loading' || status === 'unavailable' || models.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          borderColor: colors.border,
          backgroundColor: colors.bg,
          color: colors.text,
        }}
        className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:opacity-80"
        title="Configurar modelo"
        aria-label="Configurar modelo"
      >
        <Settings2 size={17} />
        <span className="hidden sm:inline">{currentProvider?.label ?? 'Modelo'}</span>
        <span
          style={{ backgroundColor: statusColor }}
          className="h-2 w-2 rounded-full"
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onMouseDown={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Configurações de modelo"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }}
            className="w-full max-w-md rounded-lg border p-5 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Modelo</h2>
                <div
                  style={{ color: colors.textSecondary }}
                  className="mt-1 flex items-center gap-2 text-xs font-medium"
                >
                  <span
                    style={{ backgroundColor: statusColor }}
                    className="h-2 w-2 rounded-full"
                  />
                  <span>{statusText}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
                className="rounded-md border p-2 transition-colors hover:opacity-80"
                aria-label="Fechar"
                title="Fechar"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                <span>Provedor</span>
                <Select value={selectedProvider} onValueChange={(value) => onProviderChange(value as ModelProvider)} disabled={!isConnected}>
                  <SelectTrigger
                    backgroundColor={colors.bg}
                    borderColor={colors.border}
                    textColor={colors.text}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    backgroundColor={colors.card}
                    borderColor={colors.border}
                    textColor={colors.text}
                  >
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider.value}
                        value={provider.value}
                        textColor={colors.text}
                      >
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                <span>Modelo</span>
                <Select value={selectedModel || undefined} onValueChange={onModelChange} disabled={modelSelectDisabled}>
                  <SelectTrigger
                    backgroundColor={colors.bg}
                    borderColor={colors.border}
                    textColor={colors.text}
                  >
                    <SelectValue placeholder={modelSelectDisabled ? 'Indisponível' : 'Selecione'} />
                  </SelectTrigger>
                  <SelectContent
                    backgroundColor={colors.card}
                    borderColor={colors.border}
                    textColor={colors.text}
                  >
                    {models.map((model) => (
                      <SelectItem
                        key={model.model}
                        value={model.model}
                        textColor={colors.text}
                      >
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              {needsApiKey && (
                <label className="grid gap-2 text-sm font-medium">
                  <span>API key</span>
                  <div className="relative">
                    <KeyRound
                      size={15}
                      style={{ color: colors.textTertiary }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(event) => onApiKeyChange(event.target.value)}
                      placeholder={`${currentProvider?.label ?? 'API'} key`}
                      backgroundColor={colors.bg}
                      borderColor={colors.border}
                      textColor={colors.text}
                      className="pl-9 pr-10"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(value => !value)}
                      style={{ color: colors.textTertiary }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:opacity-80"
                      aria-label={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
                      title={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};
