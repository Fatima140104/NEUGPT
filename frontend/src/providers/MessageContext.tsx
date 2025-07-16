import type { ExtendedFile } from "@/common/types";
import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: Map<string, ExtendedFile>;
}

type MessageAction = {
  type: "SET_FILES";
  payload:
    | Map<string, ExtendedFile>
    | ((prev: Map<string, ExtendedFile>) => Map<string, ExtendedFile>);
};

interface MessageState {
  files?: Map<string, ExtendedFile>;
}

const initialState: MessageState = {
  files: new Map(),
};

const messageReducer = (
  state: MessageState,
  action: MessageAction
): MessageState => {
  switch (action.type) {
    case "SET_FILES":
      if (typeof action.payload === "function") {
        // updater function: (prev: Map) => Map
        return { ...state, files: action.payload(state.files || new Map()) };
      } else {
        // direct Map
        return { ...state, files: action.payload };
      }
    default:
      return state;
  }
};

interface MessageContextType {
  state: MessageState;
  dispatch: React.Dispatch<MessageAction>;
  files: Map<string, ExtendedFile>;
  setFiles: React.Dispatch<React.SetStateAction<Map<string, ExtendedFile>>>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  const setFiles: React.Dispatch<
    React.SetStateAction<Map<string, ExtendedFile>>
  > = (value) => {
    dispatch({ type: "SET_FILES", payload: value });
  };

  return (
    <MessageContext.Provider
      value={{
        state,
        dispatch,
        files: state.files || new Map(),
        setFiles,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
