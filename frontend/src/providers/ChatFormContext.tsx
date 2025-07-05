import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { ExtendedFile } from "@/common/types";

interface ChatFormState {
  files: Map<string, ExtendedFile>;
  filesLoading?: boolean;
}

type ChatFormAction =
  | {
      type: "SET_FILES";
      payload:
        | Map<string, ExtendedFile>
        | ((prev: Map<string, ExtendedFile>) => Map<string, ExtendedFile>);
    }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "SET_FILES_LOADING"; payload: boolean };

const initialState: ChatFormState = {
  files: new Map<string, ExtendedFile>(),
  filesLoading: false,
};

const chatFormReducer = (
  state: ChatFormState,
  action: ChatFormAction
): ChatFormState => {
  switch (action.type) {
    case "SET_FILES":
      if (typeof action.payload === "function") {
        // updater function: (prev: Map) => Map
        return { ...state, files: action.payload(state.files || new Map()) };
      } else {
        // direct Map
        return { ...state, files: action.payload };
      }
    case "REMOVE_FILE":
      if (!state.files) return state;
      const newFiles = new Map(state.files);
      newFiles.delete(action.payload);
      return { ...state, files: newFiles };
    case "SET_FILES_LOADING":
      return {
        ...state,
        filesLoading: action.payload,
      };
    default:
      return state;
  }
};

interface ChatFormContextType {
  state: ChatFormState;
  dispatch: React.Dispatch<ChatFormAction>;
  files: Map<string, ExtendedFile>;
  setFiles: React.Dispatch<React.SetStateAction<Map<string, ExtendedFile>>>;
  removeFile: (file_id: string) => void;
  setFilesLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatFormContext = createContext<ChatFormContextType | undefined>(
  undefined
);

export const ChatFormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatFormReducer, initialState);

  const setFiles: React.Dispatch<
    React.SetStateAction<Map<string, ExtendedFile>>
  > = (value) => {
    dispatch({ type: "SET_FILES", payload: value });
  };
  const removeFile = (file_id: string) =>
    dispatch({ type: "REMOVE_FILE", payload: file_id });
  const setFilesLoading: React.Dispatch<React.SetStateAction<boolean>> = (
    value
  ) => {
    if (typeof value === "function") {
      dispatch({
        type: "SET_FILES_LOADING",
        payload: value(state.filesLoading ?? false),
      });
    } else {
      dispatch({ type: "SET_FILES_LOADING", payload: value });
    }
  };

  return (
    <ChatFormContext.Provider
      value={{
        state,
        dispatch,
        files: state.files || new Map(),
        setFiles,
        setFilesLoading,
        removeFile,
      }}
    >
      {children}
    </ChatFormContext.Provider>
  );
};

export const useChatForm = () => {
  const context = useContext(ChatFormContext);
  if (context === undefined) {
    throw new Error("useChatForm must be used within a ChatFormProvider");
  }
  return context;
};
