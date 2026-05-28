import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";
import { CleanMessageBubble } from "./cleanMessageBubble";
import { useTheme } from "@/contexts/themeContext";
import { COLORS, PT_BR } from "@/shared/constants";
import { getColors } from "@/shared/utils";
import { MessageSquareMore, Zap } from "lucide-react";

interface CleanChatContainerProps {
    messages: Message[];
    isTyping: boolean;
    currentResponse: string;
}

export const CleanChatContainer: React.FC<CleanChatContainerProps> = ({
    messages,
    isTyping,
    currentResponse,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentResponse]);

    return (
        <div
            style={{ backgroundColor: colors.bg }}
            className={`flex-1 overflow-y-auto ${messages.length === 0 && 'flex flex-col items-center justify-center'}`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {messages.length === 0 && !isTyping && !currentResponse && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div
                            style={{
                                color: colors.text,
                            }}
                            className="max-w-md text-center flex items-center justify-center flex-col"
                        >
                            <Zap fill={colors.userMessageBg} color={colors.userMessageBg} style={{marginBottom: 16}} size={64} />
                            <h2 className="text-2xl font-semibold mb-3" style={{ color: colors.textSecondary }}>
                                {PT_BR.chat.startConversation}
                            </h2>
                            <p style={{ color: colors.textTertiary }} className="leading-relaxed">
                                {PT_BR.chat.askQuestion}
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <CleanMessageBubble key={message.id} message={message} />
                ))}

                {(isTyping || currentResponse) && (
                    <div className="flex justify-start mb-4">
                        <div
                            style={{
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                            }}
                            className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg border px-4 py-3"
                        >
                            {currentResponse ? (
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                    {currentResponse}
                                </p>
                            ) : (
                                <div className="flex gap-2 items-center">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.userMessageBg }} />
                                        <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.15s]" style={{ backgroundColor: colors.userMessageBg }} />
                                        <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.3s]" style={{ backgroundColor:colors.userMessageBg }} />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                                        {PT_BR.chat.thinking}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>
        </div>
    );
};
