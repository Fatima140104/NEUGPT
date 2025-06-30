import { getToken } from "@/lib/auth";

export async function streamChat({
  url,
  body,
  onMessage,
  onDone,
  onError,
  signal,
}: {
  url: string;
  body: any;
  onMessage: (text: string) => void;
  onDone?: () => void;
  onError?: (err: any) => void;
  signal?: AbortSignal;
}) {
  try {
    const token = getToken();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let eventEnd;
      while ((eventEnd = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, eventEnd);
        buffer = buffer.slice(eventEnd + 2);

        if (event.startsWith("data: ")) {
          const data = event.slice(6).trim();
          if (data === "[DONE]") {
            onDone && onDone();
            return;
          }
          try {
            const text = JSON.parse(data);
            onMessage(text);
          } catch {
            onMessage(data);
          }
        } else if (event.startsWith("event: end")) {
          onDone && onDone();
          return;
        } else if (event.startsWith("event: error")) {
          onError && onError(event);
          return;
        }
      }
    }
    onDone && onDone();
  } catch (err) {
    onError && onError(err);
  }
}
