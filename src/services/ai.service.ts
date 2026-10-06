export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generateResponse(messages: AIMessage[], context?: Record<string, unknown>): Promise<string>;
}

export class GeminiProvider implements AIProvider {
  name = "Google Gemini";

  isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generateResponse(messages: AIMessage[], context?: Record<string, unknown>): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY chưa được cấu hình.");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        systemInstruction: {
          parts: [{
            text: `Bạn là Emma AI - Trợ lý đám cưới thông minh của nền tảng Weddingly (“Cưới thông minh – Tài chính an tâm”).
Phong thái: Sang trọng, chu đáo, tinh tế, am hiểu phong tục cưới hỏi truyền thống và xu hướng hiện đại tại Việt Nam.
Bối cảnh đám cưới hiện tại: ${JSON.stringify(context || {})}`,
          }],
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ mô hình.";
  }
}

export class OpenAIProvider implements AIProvider {
  name = "OpenAI GPT";

  isAvailable(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generateResponse(messages: AIMessage[], context?: Record<string, unknown>): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY chưa được cấu hình.");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Bạn là Emma AI - Trợ lý đám cưới thông minh của nền tảng Weddingly (“Cưới thông minh – Tài chính an tâm”).
Bối cảnh đám cưới hiện tại: ${JSON.stringify(context || {})}`,
          },
          ...messages,
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Không có phản hồi.";
  }
}

export class AIService {
  private static providers: AIProvider[] = [new GeminiProvider(), new OpenAIProvider()];

  static getActiveProvider(): AIProvider | null {
    return this.providers.find((p) => p.isAvailable()) || null;
  }

  static isConfigured(): boolean {
    return Boolean(this.getActiveProvider());
  }

  static async askEmma(messages: AIMessage[], context?: Record<string, unknown>): Promise<{ success: boolean; content?: string; error?: string }> {
    const provider = this.getActiveProvider();
    if (!provider) {
      return {
        success: false,
        error: "AI Assistant chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY hoặc OPENAI_API_KEY vào biến môi trường để kích hoạt Emma AI.",
      };
    }

    try {
      const response = await provider.generateResponse(messages, context);
      return { success: true, content: response };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi kết nối với AI.";
      return { success: false, error: msg };
    }
  }
}
