'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDocumentForm } from './components/uploadDocumentForm';
import { UploadSuccess } from './components/uploadSuccess';
import { useTheme } from '@/contexts/themeContext';
import { PT_BR } from '@/shared/constants';
import { getColors } from '@/shared/utils';
import { UploadCloud } from 'lucide-react';

interface UploadResult {
    documentId: string;
    chunksCount: number;
}

const UploadPage = () => {
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const handleUploadSuccess = (result: UploadResult) => {
        setUploadResult(result);
        setError(null);
    };

    const handleUploadError = (errorMessage: string) => {
        setError(errorMessage);
        setUploadResult(null);
    };

    const handleStartChat = () => {
        router.push('/');
    };

    const handleUploadAnother = () => {
        setUploadResult(null);
        setError(null);
    };

    return (
        <div
            style={{ backgroundColor: colors.bg }}
            className="flex-1 overflow-hidden flex flex-col h-full"
        >
            <div className="flex-1 overflow-y-auto flex items-start justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <div
                            style={{
                                backgroundColor: theme === 'dark' ? colors.card : '',
                                borderColor: colors.border,
                                color: colors.text,
                            }}
                            className="inline-block mb-4 p-4 border rounded-lg"
                        >
                            <UploadCloud size={40} color={colors.userMessageBg}/>
                        </div>
                        <h1
                            style={{ color: colors.text }}
                            className="text-3xl sm:text-4xl font-semibold mb-3"
                        >
                            {PT_BR.upload.title}
                        </h1>
                        <p
                            style={{ color: colors.textSecondary }}
                            className="text-base"
                        >
                            {PT_BR.upload.subtitle}
                        </p>
                    </div>

                    <div
                        style={{
                            backgroundColor: theme === 'dark' ? colors.card : '',
                            borderColor: colors.border,
                        }}
                        className="border rounded-lg p-6 sm:p-8"
                    >
                        {error && (
                            <div
                                style={{
                                    backgroundColor: colors.errorBg,
                                    borderColor: colors.errorBorder,
                                    color: colors.errorText,
                                }}
                                className="mb-6 p-4 rounded-lg border"
                            >
                                <p className="font-medium">{PT_BR.upload.errorTitle}: {error}</p>
                            </div>
                        )}

                        {uploadResult ? (
                            <UploadSuccess
                                result={uploadResult}
                                onStartChat={handleStartChat}
                                onUploadAnother={handleUploadAnother}
                            />
                        ) : (
                            <UploadDocumentForm
                                onSuccess={handleUploadSuccess}
                                onError={handleUploadError}
                                isUploading={isUploading}
                                setIsUploading={setIsUploading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
