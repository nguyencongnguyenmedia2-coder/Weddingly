# EMMA AI WEDDING ASSISTANT - ARCHITECTURE & CAPABILITIES

## 1. Multi-Provider Pattern
The AI engine in `src/services/ai.service.ts` implements a multi-provider interface:
- **`GeminiProvider`**: Uses Google Gemini 1.5 Flash API with wedding planning context.
- **`OpenAIProvider`**: Uses OpenAI GPT-4o-mini completions.

## 2. Graceful State & No-Mock Rule
If neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` is configured in the environment, Emma AI cleanly presents an actionable configuration alert:
*"AI Assistant chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY hoặc OPENAI_API_KEY vào biến môi trường để kích hoạt Emma AI."*
Per Section 36 & 81, responses are never faked.
