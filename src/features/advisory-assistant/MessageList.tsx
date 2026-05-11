"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Message, Locale } from "@/types";
import { ASSISTANT_STRINGS } from "@/lib/i18n";

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  locale: Locale;
}

export function MessageList({ messages, streamingContent, locale }: MessageListProps) {
  const strings = ASSISTANT_STRINGS[locale];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div className="flex-1 overflow-y-auto advisory-scroll px-4 py-4 space-y-3 min-h-0">
      {isEmpty && (
        <EmptyState locale={locale} />
      )}

      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                msg.role === "user" ? "msg-user max-w-[85%]" : "msg-assistant max-w-[90%]"
              }
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Streaming content */}
      {streamingContent && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="msg-assistant max-w-[90%]">
            {streamingContent}
            <span className="inline-block w-0.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Typing indicator */}
      {!streamingContent && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="msg-assistant flex items-center gap-1 py-3">
            <div className="flex gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function EmptyState({ locale }: { locale: Locale }) {
  const openingPrompts =
    locale === "pl"
      ? [
          "Dostawca zapowiedział podwyżkę o 12%",
          "Nie mamy benchmarków cenowych",
          "Chcemy zbudować strategię zakupową",
          "Potrzebujemy lepszej widoczności wydatków",
        ]
      : [
          "Our supplier announced a 12% price increase",
          "We don't have any pricing benchmarks",
          "We want to build a procurement strategy",
          "We need better spend visibility",
        ];

  return (
    <div className="space-y-5 pt-2">
      {/* Advisory intro */}
      <div className="space-y-1.5">
        <p className="advisory-label">
          {locale === "pl" ? "Doradca Zakupowy" : "Procurement Advisor"}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed font-medium">
          {locale === "pl"
            ? "Opisz sytuację zakupową. Powiem Ci, co możemy zrobić."
            : "Describe your procurement situation. I'll tell you what we can do."}
        </p>
      </div>

      {/* Situation prompts */}
      <div className="space-y-2">
        <p className="text-2xs font-medium tracking-widest uppercase text-gray-400">
          {locale === "pl" ? "Typowe sytuacje" : "Common situations"}
        </p>
        <div className="space-y-1.5">
          {openingPrompts.map((prompt) => (
            <button
              key={prompt}
              className="w-full text-left text-sm text-gray-600 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-150 leading-snug"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
