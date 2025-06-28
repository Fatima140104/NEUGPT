import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatState {
  messageTree: Message[];
  currentConversationId: string | null;
  abortScroll: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  selectedChat?: string | null;
  isAwaitingFirstChunk?: boolean;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_MESSAGES" }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "SET_ABORT_SCROLL"; payload: boolean }
  | { type: "SET_IS_SUBMITTING"; payload: boolean }
  | { type: "SET_AWAITING_FIRST_CHUNK"; payload: boolean };

const initialState: ChatState = {
  messageTree: [],
  currentConversationId: null,
  abortScroll: false,
  isSubmitting: false,
  isLoading: false,
  selectedChat: null,
  isAwaitingFirstChunk: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messageTree: [...state.messageTree, action.payload],
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messageTree: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messageTree: [],
      };
    case "SET_ABORT_SCROLL":
      return {
        ...state,
        abortScroll: action.payload,
      };
    case "SET_IS_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case "SET_AWAITING_FIRST_CHUNK":
      return {
        ...state,
        isAwaitingFirstChunk: action.payload,
      };
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
