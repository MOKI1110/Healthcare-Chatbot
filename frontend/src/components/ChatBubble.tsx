import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  sender: "user" | "bot";
  text: string;
  isHealthRelated?: boolean;
}

export default function ChatBubble({ sender, text, isHealthRelated }: ChatBubbleProps) {
  const isUser = sender === "user";
  const showWarning = sender === "bot" && isHealthRelated === false;

  return (
    <div
      className={clsx(
        "w-full flex mb-3 animate-fadeIn",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "relative px-4 py-3 rounded-3xl shadow-md animate-fadeIn",
          "max-w-[85%] md:max-w-[75%] lg:max-w-[65%]",
          "text-[15px] leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-[#4C5BD8] text-white"   // user bubble (right, darker blue)
            : "bg-[#3A4CA8] text-white"   // bot bubble (left, softer blue)
        )}
      >
        {/* Bubble tail */}
        <span
          className={clsx(
            "absolute bottom-1 w-3 h-3 rounded-full",
            isUser
              ? "right-[-4px] bg-[#4C5BD8]"
              : "left-[-4px] bg-[#3A4CA8]"
          )}
        />

        {/* ⚠️ Non-health warning */}
        {showWarning && (
          <div className="mb-3 p-3 rounded-2xl bg-yellow-100/95 text-yellow-900 text-sm flex gap-2 shadow-sm">
            <span>⚠️</span>
            <span>This document may not be health-related.</span>
          </div>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2">{children}</p>,

            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),

            em: ({ children }) => <em className="italic">{children}</em>,

            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li>{children}</li>,

            a: ({ href, children }) => (
              <a
                href={href}
                className="text-teal-200 underline hover:text-teal-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            h1: ({ children }) => (
              <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-semibold mb-2 mt-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold mb-2 mt-2">{children}</h3>
            ),

            hr: () => <hr className="my-3 border-white/20" />,

            // Code blocks
            pre: ({ children }) => (
              <pre className="bg-black/25 text-teal-50 p-3 rounded-xl overflow-x-auto text-[13px] font-mono my-3">
                {children}
              </pre>
            ),

            // Inline vs fenced code
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="bg-black/20 px-1.5 py-0.5 rounded text-[13px] font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },

            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border border-white/20 rounded-lg text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-white/10 border-b border-white/20">
                {children}
              </thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="even:bg-white/5">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="border border-white/20 px-3 py-2 font-semibold text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-white/20 px-3 py-2">
                {children}
              </td>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
