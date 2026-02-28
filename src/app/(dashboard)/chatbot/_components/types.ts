export type MessageRole = "assistant" | "user";

export type MessageType = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  model?: string;
  suggestions?: string[];
  attachment?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
};

export type AIModel = {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  isFree?: boolean;
};

export type ChatSuggestion = {
  id: string;
  label: string;
  icon: string;
};

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-oss-20b",
    name: "gpt-oss-20b",
    description: "Default Model (Free)",
    isDefault: true,
    isFree: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Fastest & most capable",
    isDefault: false,
    isFree: false,
  },
  {
    id: "gpt-5-preview",
    name: "GPT-5 Preview",
    description: "Reasoning capabilities",
    isDefault: false,
    isFree: false,
  },
];

export const DEFAULT_SUGGESTIONS: ChatSuggestion[] = [
  { id: "1", label: "Analyze food spending", icon: "pie-chart" },
  { id: "2", label: "How can I save more?", icon: "lightbulb" },
  { id: "3", label: "Create a budget plan", icon: "check-square" },
];

export type ExportFormat = "pdf" | "markdown" | "json";

// Extended types for backend integration
export interface ChatSession {
  id: string;
  userId: string;
  messages: MessageType[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResult {
  success: boolean;
  message?: MessageType;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}

export type ModelLoadingState = "idle" | "loading" | "streaming" | "error";

export interface ChatState {
  messages: MessageType[];
  isLoading: boolean;
  loadingState: ModelLoadingState;
  error: string | null;
  selectedModel: string;
}
