import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";

interface ChatBubbleProps {
  sender: "user" | "bot";
  text: string;
  isHealthRelated?: boolean;
}

export default function ChatBubble({ sender, text, isHealthRelated }: ChatBubbleProps) {
  const isBot = sender === "bot";
  const isUserMessage = sender === "user";
  const showWarning = isBot && isHealthRelated === false && text.includes("⚠️");

  return (
    <div
      className={clsx(
        "my-2 flex w-full",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "relative group px-4 py-3 rounded-2xl shadow-md overflow-hidden",
          "transition-all duration-300 max-w-full sm:max-w-[80%] lg:max-w-[70%]",
          "text-sm md:text-[15px] leading-relaxed break-words",
          isUserMessage
            ? "bg-primary-600 text-white"
            : "bg-primary-50 text-secondary-900 border border-primary-200"
        )}
      >
        {/* Warning banner for non-health documents */}
        {showWarning && (
          <div className="mb-3 p-3 rounded-xl bg-yellow-50 border border-yellow-300">
            <p className="text-xs md:text-sm text-yellow-800 font-medium flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>This document may not be health-related</span>
            </p>
          </div>
        )}

        {/* Hover effect overlay */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
            isUserMessage ? "bg-white" : "bg-primary-400"
          )}
        />

        {/* Message content with markdown rendering */}
        <div className="relative z-10 max-w-full [&>*:first-child]:mt-0 [&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0 [&>p:first-child]:mt-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom table styling - adapts to user/bot messages
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table
                    className={clsx(
                      "min-w-full border-collapse rounded-lg text-xs md:text-sm",
                      isUserMessage
                        ? "border border-white/25 bg-white/10"
                        : "border border-secondary-300 bg-white"
                    )}
                  >
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead
                  className={clsx(
                    isUserMessage ? "bg-white/20" : "bg-primary-100"
                  )}
                >
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody
                  className={clsx(
                    "divide-y",
                    isUserMessage
                      ? "divide-white/20"
                      : "divide-secondary-200"
                  )}
                >
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr
                  className={clsx(
                    "transition-colors",
                    isUserMessage
                      ? "hover:bg-white/15"
                      : "hover:bg-primary-50"
                  )}
                >
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th
                  className={clsx(
                    "px-3 py-2 text-left font-semibold align-middle",
                    isUserMessage
                      ? "border border-white/25 text-white"
                      : "border border-secondary-300 text-secondary-900"
                  )}
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td
                  className={clsx(
                    "px-3 py-2 align-top",
                    isUserMessage
                      ? "border border-white/20 text-white"
                      : "border border-secondary-300 text-secondary-900"
                  )}
                >
                  {children}
                </td>
              ),

              // Heading styling
              h1: ({ children }) => (
                <h1 className="text-xl md:text-2xl font-bold mt-4 mb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg md:text-xl font-bold mt-4 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base md:text-lg font-semibold mt-3 mb-2">
                  {children}
                </h3>
              ),

              // Paragraph styling
              p: ({ children }) => (
                <p className="mb-2 md:mb-3 leading-relaxed first:mt-0">
                  {children}
                </p>
              ),

              // List styling
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-2 md:mb-3 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-2 md:mb-3 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">{children}</li>
              ),

              // Horizontal rule
              hr: () => (
                <hr
                  className={clsx(
                    "my-3 md:my-4",
                    isUserMessage ? "border-white/30" : "border-secondary-300"
                  )}
                />
              ),

              // Code blocks & inline code
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className={clsx(
                        "rounded px-1.5 py-0.5 text-[0.85em] font-mono",
                        isUserMessage
                          ? "bg-white/15 text-white"
                          : "bg-secondary-100 text-secondary-900"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                // fenced code block
                return (
                  <pre
                    className={clsx(
                      "my-3 rounded-lg p-3 overflow-x-auto text-[0.8em] font-mono",
                      isUserMessage
                        ? "bg-black/20 border border-white/20 text-white"
                        : "bg-secondary-900/5 border border-secondary-300 text-secondary-900",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </pre>
                );
              },

              // Link styling
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  className={clsx(
                    "underline underline-offset-2 transition-all",
                    isUserMessage
                      ? "text-white/90 hover:text-white"
                      : "text-primary-600 hover:text-primary-700"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),

              // Bold text styling
              strong: ({ children }) => (
                <strong className="font-semibold">
                  {children}
                </strong>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>

        {/* Chat bubble tail */}
        <div
          className={clsx(
            "absolute bottom-0 w-0 h-0",
            isUserMessage
              ? "right-0 border-8 border-l-transparent border-b-transparent border-primary-600 translate-x-2 translate-y-2"
              : "left-0 border-8 border-r-transparent border-b-transparent border-primary-50 -translate-x-2 translate-y-2"
          )}
        />
      </div>
    </div>
  );
}
