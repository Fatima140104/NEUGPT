import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { getToken } from "@/lib/auth";
import { useAuthFetch } from "@/hooks/useAuthFetch";
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
      return { ...state, sessions: action.payload || [] };
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
  const authFetch = useAuthFetch();

  // Fetch sessions from backend
  const fetchSessions = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await authFetch(`/sessions`);
      if (res === null) {
        // This case occurs on 401 redirect, no further action needed
        return;
      }

      if (res.status !== 200) {
        throw new Error(`Failed to fetch sessions: ${res.statusText}`);
      }
      const data = await res.data;
      // Ensure data is an array, default to empty array if not
      const sessions = Array.isArray(data) ? data : [];
      dispatch({ type: "SET_SESSIONS", payload: sessions });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      dispatch({ type: "SET_SESSIONS", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [authFetch]);

  // Select a session
  const selectSession = (id: string) => {
    dispatch({ type: "SELECT_SESSION", payload: id });
  };

  // Add, update, delete session
  const addSession = async (title = "Cuộc trò chuyện mới") => {
    try {
      const res = await authFetch("/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
        }),
      });
      if (res === null) return;
      if (res.status !== 200) throw new Error("Failed to create new session");
      const newSession = await res.data;
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
  const updateSession = async (session: ChatSession) => {
    try {
      const res = await authFetch(`/sessions/${session._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: session.title }),
      });
      if (res === null) return;
      if (res.status !== 200) throw new Error("Failed to update session");
      const updatedSession = await res.data;
      dispatch({ type: "UPDATE_SESSION", payload: updatedSession });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const deleteSession = async (id: string) => {
    try {
      const res = await authFetch(`/sessions/${id}`, {
        method: "DELETE",
      });
      if (res === null) return;
      if (res.status !== 200) throw new Error("Failed to delete session");
      dispatch({ type: "DELETE_SESSION", payload: id });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // fetch sessions on mount
  useEffect(() => {
    if (getToken()) {
      fetchSessions();
    } else {
      // Clear sessions if no token is found (e.g., after logout)
      dispatch({ type: "SET_SESSIONS", payload: [] });
    }
  }, [fetchSessions]);

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
