'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/themeContext';
import { Moon, Sun, MessageCircle, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PT_BR } from '@/shared/constants';
import { getColors } from '@/shared/utils';
import { ModelSelector } from './ModelSelector';
import type { ModelProvider } from '@/contexts/modelContext';

interface HeaderProps {
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

export const Header: React.FC<HeaderProps> = ({
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
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const colors = getColors(theme);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };
    const isChatRoute = pathname === '/';

    return (
        <header
            style={{
                borderBottomColor: colors.borderLight,
                backgroundColor: colors.bgSecondary
            }}
            className="border-b"
        >
            <div className={isChatRoute ? 'md:flex' : ''}>
                {isChatRoute && <div className="hidden w-72 shrink-0 md:block" />}

                <div className="min-w-0 flex-1">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className='flex gap-2 items-center'>
                         <nav className="flex items-center gap-2">
                                    <Link
                                        href="/"
                                        style={{
                                            backgroundColor: isActive('/') ? colors.borderLight : 'transparent',
                                            color: isActive('/') ? colors.userMessageBg : colors.text,
                                            borderColor: colors.border
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border rounded-md"
                                        >
                                        <MessageCircle size={18} color={isActive('/') ? colors.userMessageBg : colors.text} fill={isActive('/') ? colors.userMessageBg : 'transparent'} />
                                        <span className="hidden sm:inline">{PT_BR.header.chat}</span>
                                    </Link>
                                    <Link
                                        href="/upload"
                                        style={{
                                            backgroundColor: isActive('/upload') ? colors.borderLight : 'transparent',
                                            color: isActive('/upload') ? colors.userMessageBg : colors.text,
                                            borderColor: colors.border
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border rounded-md"
                                        >
                                        <Upload size={18} color={isActive('/upload') ? colors.userMessageBg : colors.text} />
                                        <span className="hidden sm:inline">{PT_BR.header.upload}</span>
                                    </Link>
                                </nav>
                                        </div>
                            <div className='flex flex-wrap justify-end gap-2 items-center'>
                                 <ModelSelector
                                models={models}
                                selectedProvider={selectedProvider}
                                onProviderChange={onProviderChange}
                                selectedModel={selectedModel}
                                onModelChange={onModelChange}
                                apiKey={apiKey}
                                onApiKeyChange={onApiKeyChange}
                                isConnected={isConnected}
                                status={status}
                                statusText={statusText}
                            />
                                
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor: colors.bg,
                                        color: colors.text
                                    }}
                                    className="p-2 rounded border transition-colors hover:opacity-80 "
                                    aria-label={PT_BR.header.toggleTheme}
                                >
                                    {theme === 'light' ? (
                                        <Moon size={18} />
                                    ) : (
                                        <Sun size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};
