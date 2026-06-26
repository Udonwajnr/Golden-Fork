"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm the Golden Fork assistant. Ask me about the menu, hours, reservations, or check on an order you've already placed.",
};

const SUGGESTIONS = [
  "What's good for someone who doesn't eat meat?",
  "What are your hours?",
  "Where's my order GF-...",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversation: nextMessages
            .slice(0, -1)
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-20),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        if (res.status === 503) setUnavailable(true);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Please try again." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the server. Please try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-gf-gold text-gf-bg shadow-lg shadow-black/30 transition-transform hover:scale-105 sm:bottom-6 sm:right-6",
          open && "rotate-90"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-22 right-5 z-50 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-gf-border bg-gf-bg-card shadow-2xl sm:bottom-24 sm:right-6">
          <div className="flex items-center gap-2.5 border-b border-gf-border bg-gf-bg-elevated px-4 py-3">
            <span className="tine-divider" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </span>
            <div className="flex-1">
              <p className="font-display text-sm text-gf-cream">Golden Fork Assistant</p>
              <p className="flex items-center gap-1 text-[11px] text-gf-muted">
                <Sparkles className="size-2.5 text-gf-gold" /> Powered by Claude
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-gf-muted hover:text-gf-cream">
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-gf-gold text-gf-bg"
                    : "bg-gf-bg-elevated text-gf-cream"
                )}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 rounded-lg bg-gf-bg-elevated px-3 py-2 text-sm text-gf-muted">
                <Loader2 className="size-3.5 animate-spin" /> Thinking...
              </div>
            )}
            {unavailable && (
              <p className="text-center text-xs text-gf-muted-2">
                Chat assistant isn&apos;t configured on this deployment yet.
              </p>
            )}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-gf-border px-3 pt-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-gf-border px-2.5 py-1 text-xs text-gf-muted hover:border-gf-gold-dim hover:text-gf-gold"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gf-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu, hours, your order..."
              disabled={unavailable}
              className="flex-1 rounded-md border border-gf-border bg-gf-bg-elevated px-3 py-2 text-sm text-gf-cream placeholder:text-gf-muted-2 outline-none focus-visible:border-gf-gold-dim disabled:opacity-50"
            />
            <Button type="submit" variant="gold" size="icon" disabled={isSending || unavailable || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}