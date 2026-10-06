"use client";

import * as React from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIService, AIMessage } from "@/services/ai.service";

interface EmmaAIWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: Record<string, unknown>;
}

export function EmmaAIWidget({ isOpen, onClose, contextData }: EmmaAIWidgetProps) {
  const [messages, setMessages] = React.useState<AIMessage[]>([
    {
      role: "assistant",
      content:
        "Xin chào Minh Anh & Quốc Minh! Mình là Emma AI – Trợ lý đám cưới chuyên nghiệp của bạn. Mình có thể giúp gì cho ngày trọng đại của hai bạn hôm nay?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const samplePrompts = [
    "Lập kế hoạch phân bổ ngân sách 300 triệu",
    "Còn 6 tháng nữa cưới cần ưu tiên việc gì?",
    "Gợi ý lời mời thiệp cưới trang trọng cho phụ huynh",
    "Gợi ý lời chúc ngọt ngào viết trong sổ ký tên",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const newMessages: AIMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);

    const result = await AIService.askEmma(newMessages, contextData);

    if (result.success && result.content) {
      setMessages([...newMessages, { role: "assistant", content: result.content }]);
    } else {
      setErrorMessage(
        result.error ||
          "AI Assistant chưa được cấu hình khóa API (GEMINI_API_KEY hoặc OPENAI_API_KEY)."
      );
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#2C2422]/50 backdrop-blur-xs sm:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-x-3 bottom-20 sm:bottom-6 sm:right-6 sm:inset-x-auto z-50 w-auto sm:w-full sm:max-w-md rounded-[24px] border border-[#D6BE91] bg-[#FFFDF9] shadow-2xl dark:bg-[#181413] dark:border-[#3A302E] overflow-hidden flex flex-col h-[500px] sm:h-[560px] max-h-[78vh] animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Widget Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#8B5E5A] to-[#6A4643] px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D6BE91] text-[#2C2422]">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif text-sm font-bold">Emma AI Wedding Assistant</h4>
              <Sparkles className="h-3 w-3 text-[#D6BE91]" />
            </div>
            <p className="text-[10px] text-white/80">Trợ lý lập kế hoạch đám cưới cao cấp</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[16px] p-3 leading-relaxed ${
                m.role === "user"
                  ? "bg-[#8B5E5A] text-white rounded-br-none"
                  : "bg-white border border-[#EADBCE] text-[#2C2422] rounded-bl-none shadow-sm dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-[16px] bg-white border border-[#EADBCE] p-3 text-[#6B5E5B] dark:bg-[#221C1B] dark:border-[#3A302E]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#8B5E5A]" />
              <span>Emma đang suy nghĩ và tính toán cho bạn...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-[12px] bg-[#FDF2F2] border border-[#F7CDCD] p-3 text-[#B44A4A] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Preset Prompt Suggestions */}
      <div className="px-4 py-2 border-t border-[#EADBCE] dark:border-[#3A302E] bg-[#F5EFE7]/50 dark:bg-[#221C1B]/50 overflow-x-auto flex gap-1.5 scrollbar-none">
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="shrink-0 rounded-full border border-[#D6BE91] bg-white px-2.5 py-1 text-[10px] text-[#8B5E5A] hover:bg-[#F5EFE7] dark:bg-[#2A2321] transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#EADBCE] bg-white dark:bg-[#181413] dark:border-[#3A302E] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập câu hỏi về ngân sách, khách mời, kịch bản..."
          className="flex-1 rounded-[12px] border border-[#EADBCE] bg-[#FFFDF9] px-3 py-2 text-xs text-[#2C2422] placeholder:text-[#A69591] focus:outline-none focus:ring-2 focus:ring-[#D6BE91] dark:bg-[#221C1B] dark:border-[#3A302E] dark:text-[#F5EFE7]"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="rounded-[12px] px-3"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
    </>
  );
}
