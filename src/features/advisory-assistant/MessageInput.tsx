"use client";

import { useRef, useState, useCallback } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export function MessageInput({ onSend, placeholder, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      // Auto-resize
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
      }
    },
    []
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
      <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 focus-within:border-gray-400 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed min-h-[1.25rem] max-h-[7.5rem]"
          style={{ height: "1.25rem" }}
          aria-label="Your message"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150
            disabled:opacity-30 disabled:cursor-not-allowed
            bg-[#242F44] text-white hover:bg-[#1a2235] disabled:bg-gray-300"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M11.5 6.5L2 11L3.5 6.5M11.5 6.5L2 2L3.5 6.5M11.5 6.5H3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
