import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store/store.tsx";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "@/index.css";
import App from "@/App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Smooth corners (for squircle)
if (window.CSS && "paintWorklet" in window.CSS) {
  (window.CSS as any).paintWorklet.addModule(
    "https://unpkg.com/smooth-corners"
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
