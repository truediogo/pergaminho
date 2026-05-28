import { uploadDocument } from '@/services/api';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '@/contexts/themeContext';
import { PT_BR } from '@/shared/constants';
import { getColors } from '@/shared/utils';
import { FolderOpen, CloudUpload } from 'lucide-react';
import { MdInsertDriveFile } from 'react-icons/md';

interface UploadDocumentFormProps {
    onSuccess: (result: any) => void;
    onError: (error: string) => void;
    isUploading: boolean;
    setIsUploading: (loading: boolean) => void;
}

export const UploadDocumentForm: React.FC<UploadDocumentFormProps> = ({
    onSuccess,
    onError,
    isUploading,
    setIsUploading,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
    });

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const result = await uploadDocument(selectedFile);
            onSuccess(result.data);
        } catch (error: any) {
            onError(error.response?.data?.message || PT_BR.upload.errorUploading);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                style={{
                    borderColor: isDragActive ? colors.userMessageBg : colors.border,
                    backgroundColor: isDragActive ? colors.borderLight : 'transparent',
                }}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="space-y-3">
                        <CloudUpload size={48} className="mx-auto" color={colors.userMessageBg} />
                        <div>
                            <p
                                style={{ color: colors.text }}
                                className="text-lg font-semibold"
                            >
                                Arquivo selecionado:
                            </p>
                            <p style={{ color: colors.text }}>{selectedFile.name}</p>
                            <p
                                style={{ color: colors.textSecondary }}
                                className="text-sm"
                            >
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <FolderOpen size={48} className="mx-auto" color={colors.userMessageBg}/>
                        <div>
                            <p
                                style={{ color: colors.text }}
                                className="text-lg font-semibold"
                            >
                                {isDragActive
                                    ? 'Solte o arquivo aqui...'
                                    : 'Arraste um arquivo ou clique para selecionar'}
                            </p>
                            <p style={{ color: colors.textSecondary }}>
                                {PT_BR.upload.supportedFormats}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {selectedFile && (
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading}
                        style={{
                            backgroundColor: isUploading ? colors.textTertiary : colors.userMessageBg,
                            color: '#ffffff',
                        }}
                        className="w-full rounded-lg font-semibold transition-all py-3 px-6 border-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {PT_BR.upload.uploading}
                            </span>
                        ) : (
                            PT_BR.upload.uploadButton
                        )}
                    </button>

                    <button
                        onClick={() => setSelectedFile(null)}
                        style={{
                            borderColor: colors.border,
                            color: colors.text,
                        }}
                        className="w-full px-6 py-3 border rounded-lg font-semibold transition-all hover:opacity-80"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};