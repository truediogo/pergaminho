import { Message } from "@/types/chat";
import { useTheme } from "@/contexts/themeContext";
import { useMemo } from "react";
import { COLORS } from "@/shared/constants";
import { formatTime, processContentLinks } from "@/shared/utils";
import ReactMarkdown from "react-markdown";

interface CleanMessageBubbleProps {
  message: Message;
}

export const CleanMessageBubble: React.FC<CleanMessageBubbleProps> = ({ message }) => {
  const { theme } = useTheme();
  const isUser = message.sender === "user";
  const isError = message.isError;
  const timeString = formatTime(message.timestamp);
  const colors = COLORS[theme];

  const processedContent = useMemo(() => {
    return processContentLinks(message.content);
  }, [message.content]);

  const modelLabel = [message.provider, message.model].filter(Boolean).join(' / ');

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div
          style={{
            backgroundColor: colors.userMessageBg,
            color: colors.userMessageText,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg px-4 py-3"
        >
          <div className="text-sm sm:text-base leading-relaxed prose prose-invert max-w-none" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <ReactMarkdown>
              {processedContent}
            </ReactMarkdown>
          </div>
          <span className="text-xs mt-2 block opacity-80 font-medium">
            {timeString}
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start mb-4">
        <div
          style={{
            backgroundColor: colors.errorBg,
            borderColor: colors.errorBorder,
            color: colors.errorText,
          }}
          className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg border px-4 py-3"
        >
          <div className="text-sm sm:text-base leading-relaxed prose max-w-none">
            <ReactMarkdown>
              {processedContent}
            </ReactMarkdown>
          </div>
          <span className="text-xs mt-2 block opacity-70 font-medium">
            {timeString}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.text,
        }}
        className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg border px-4 py-3"
      >
        {modelLabel && (
          <div className="mb-2 flex items-center gap-2">
            <span
              style={{
                backgroundColor: colors.modelBadgeBg,
                borderColor: colors.modelBadgeBorder,
                color: colors.modelBadgeText,
              }}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded border"
            >
              {modelLabel}
            </span>
          </div>
        )}

        <div className="text-sm sm:text-base leading-relaxed prose max-w-none" style={{ color: colors.text }}>
          <ReactMarkdown>
            {processedContent}
          </ReactMarkdown>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.sources.map((source, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.sourceBadgeBg,
                  borderColor: colors.sourceBadgeBorder,
                  color: colors.sourceBadgeText,
                }}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span className="truncate max-w-[200px]" title={source}>
                  {source}
                </span>
              </div>
            ))}
          </div>
        )}

        <span className="text-xs mt-2 block opacity-70 font-medium" style={{ color: colors.textTertiary }}>
          {timeString}
        </span>
      </div>
    </div>
  );
};
