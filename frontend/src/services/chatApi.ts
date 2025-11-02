type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function sendChatMessage({
  message,
  conversationHistory = [],
  locale = "en",
  sessionId,
}: {
  message: string;
  conversationHistory?: Message[];
  locale?: string;
  sessionId: string;
}): Promise<string> {
  const response = await fetch("http://localhost:4000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversationHistory,
      locale,
      sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error("Network error connecting to backend");
  }

  const data = await response.json();
  return data.message;
}

export async function uploadFile({
  file,
  conversationHistory = [],
  locale = "en",
  sessionId,
}: {
  file: File;
  conversationHistory?: Message[];
  locale?: string;
  sessionId: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversationHistory", JSON.stringify(conversationHistory));
  formData.append("locale", locale);
  formData.append("sessionId", sessionId);

  const response = await fetch("http://localhost:4000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  const data = await response.json();
  return data.message;
}
