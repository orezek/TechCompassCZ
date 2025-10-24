import {ChatGoogleGenerativeAI} from "@langchain/google-genai";

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";



export const GeminiFlashLite = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH_LITE,
  temperature: 0,
  maxRetries: 3,
});

export const GeminiFlash = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH,
  temperature: 0,
  maxRetries: 3,
});

export const GeminiPro = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_PRO,
  temperature: 0,
  maxRetries: 3,
});