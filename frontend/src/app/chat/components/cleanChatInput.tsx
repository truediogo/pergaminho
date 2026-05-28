import { useState, KeyboardEvent } from "react";
import { useTheme } from "@/contexts/themeContext";
import { Send } from 'lucide-react';
import { PT_BR } from "@/shared/constants";
import { getColors } from "@/shared/utils";
import { Textarea } from "@/components/ui/textarea";

interface CleanChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    disabledPlaceholder?: string;
}

export const CleanChatInput: React.FC<CleanChatInputProps> = ({
    onSendMessage,
    disabled = false,
    disabledPlaceholder,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [message, setMessage] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage("");
        }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const inputBorderColor = isFocused && !disabled ? colors.userMessageBg : colors.border;

    return (
        <div className="px-4 sm:px-6 py-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={disabled ? disabledPlaceholder ?? PT_BR.chat.inputWaiting : PT_BR.chat.inputPlaceholder}
                            disabled={disabled}
                            rows={1}
                            backgroundColor={colors.bg}
                            borderColor={inputBorderColor}
                            textColor={colors.text}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = Math.min(target.scrollHeight, 128) + "px";
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || disabled}
                        style={{
                            backgroundColor: !message.trim() || disabled ? colors.textTertiary : colors.userMessageBg,
                            color: '#ffffff',
                        }}
                        className="p-3 rounded-lg transition-all shrink-0 font-semibold border-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        title={PT_BR.chat.sendMessage}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
