import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";

export interface ChatSession {
  _id: string;
  title: string;
  timestamp: Date;
}

interface ChatSessionState {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  loading: boolean;
  error: string | null;
}

type ChatSessionAction =
  | { type: "SET_SESSIONS"; payload: ChatSession[] }
  | { type: "ADD_SESSION"; payload: ChatSession }
  | { type: "UPDATE_SESSION"; payload: ChatSession }
  | { type: "DELETE_SESSION"; payload: string }
  | { type: "SELECT_SESSION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: ChatSessionState = {
  sessions: [],
  selectedSessionId: null,
  loading: false,
  error: null,
};

const chatSessionReducer = (
  state: ChatSessionState,
  action: ChatSessionAction
): ChatSessionState => {
  switch (action.type) {
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "ADD_SESSION":
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s._id === action.payload._id ? action.payload : s
        ),
      };
    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s._id !== action.payload),
        selectedSessionId:
          state.selectedSessionId === action.payload
            ? null
            : state.selectedSessionId,
      };
    case "SELECT_SESSION":
      return { ...state, selectedSessionId: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface ChatSessionContextType {
  state: ChatSessionState;
  dispatch: React.Dispatch<ChatSessionAction>;
  fetchSessions: () => void;
  selectSession: (id: string) => void;
  addSession: (title?: string) => Promise<any>;
  updateSession: (session: ChatSession) => void;
  deleteSession: (id: string) => void;
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(
  undefined
);

export const ChatSessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatSessionReducer, initialState);

  // Fetch sessions from backend
  const fetchSessions = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await fetch(`/api/sessions`);
      const data = await res.json();
      // Map backend data to ChatSession type if needed
      dispatch({ type: "SET_SESSIONS", payload: data });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Select a session
  const selectSession = (id: string) => {
    dispatch({ type: "SELECT_SESSION", payload: id });
  };

  // Add, update, delete session
  const addSession = async (title = "Cuộc trò chuyện mới") => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
        }),
      });
      if (!res.ok) throw new Error("Failed to create new session");
      const newSession = await res.json();
      dispatch({
        type: "ADD_SESSION",
        payload: {
          _id: newSession._id || newSession.id,
          title: newSession.title || "Cuộc trò chuyện mới",
          timestamp: new Date(newSession.createdAt || Date.now()),
        },
      });
      return newSession;
    } catch (err) {
      throw err;
    }
  };
  const updateSession = (session: ChatSession) => {
    dispatch({ type: "UPDATE_SESSION", payload: session });
  };
  const deleteSession = (id: string) => {
    dispatch({ type: "DELETE_SESSION", payload: id });
  };

  // fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <ChatSessionContext.Provider
      value={{
        state,
        dispatch,
        fetchSessions,
        selectSession,
        addSession,
        updateSession,
        deleteSession,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (context === undefined) {
    throw new Error("useChatSession must be used within a ChatSessionProvider");
  }
  return context;
};
