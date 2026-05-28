import { useTheme } from '@/contexts/themeContext';
import { COLORS, PT_BR } from '@/shared/constants';
import { getColors } from '@/shared/utils';
import { MdCheckCircle } from 'react-icons/md';
import { MessageCircle } from 'lucide-react';
import { MdInsertDriveFile } from 'react-icons/md';

interface UploadSuccessProps {
    result: {
        documentId: string;
        chunksCount: number;
    };
    onStartChat: () => void;
    onUploadAnother: () => void;
}

export const UploadSuccess: React.FC<UploadSuccessProps> = ({
    result,
    onStartChat,
    onUploadAnother,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);

    return (
        <div className="text-center space-y-6">
            <div>
                <div style={{ color: colors.userMessageBg }} className="flex justify-center mb-4">
                    <MdCheckCircle size={64} />
                </div>
                <h2
                    style={{ color: colors.text }}
                    className="text-2xl font-semibold mb-3"
                >
                    {PT_BR.upload.successTitle}
                </h2>
            </div>



            <div className="flex gap-3 justify-center">
                <button
                    onClick={onStartChat}
                    style={{
                        backgroundColor: colors.userMessageBg,
                        color: '#ffffff',
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg font-semibold transition-all py-3 px-6 border-0 hover:opacity-90"
                >
                    <MessageCircle size={18} />
                    {PT_BR.upload.startChat}
                </button>

                <button
                    onClick={onUploadAnother}
                    style={{
                        borderColor: colors.border,
                        color: colors.text,
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border rounded-lg font-semibold transition-all hover:opacity-80"
                >
                    <MdInsertDriveFile size={18} />
                    {PT_BR.upload.uploadAnother}
                </button>
            </div>
        </div>
    );
};