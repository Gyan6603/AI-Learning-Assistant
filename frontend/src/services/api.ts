function handleUnauthorized(response: Response) {
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
}

export async function checkBackendHealth() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/health"
  );

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}
export async function sendChatMessage(
  message: string,
  documentId: string | undefined
  ) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    "http://127.0.0.1:8000/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: message,
        document_id: documentId?? null,
      }),
    }
  );

  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error("Chat request failed");
  }

  return response.json();
}

export async function loginUser(
  email: string,
  password: string
) {
  const response = await fetch(
    "http://127.0.0.1:8000/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Login request failed");
  }

  return response.json();
}
export async function getProfile() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/auth/profile",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error("Authentication failed");
  }

  return response.json();
}

export type Document = {
  id: string;
  filename: string;
  text_length: number;
  uploaded_at: string;
};

export async function getDocuments(): Promise<Document[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/documents",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error("Failed to fetch documents");
  }

  const data = await response.json();

  return data.documents;
}

export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `http://127.0.0.1:8000/api/documents/${documentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete PDF");
  }

  return data;
}

export type Flashcard = {
  question: string;
  answer: string;
};

export async function generateFlashcards(
  message: string,
  documentId: string,
  count: number
): Promise<Flashcard[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/flashcards",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: message,
        document_id: documentId,
        count: count,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate flashcards");
  }

  const data = await response.json();

  return data.flashcards;
}

export type QuizQuestion = {
  question: string;
  options: string[];
  question_type: "single" | "multiple";
  correct_answers: string[];
};

export async function generateQuiz(
  documentId: string
): Promise<QuizQuestion[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/quiz",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: "Generate quiz",
        document_id: documentId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate quiz");
  }

  const data = await response.json();

  return data.quiz;
}

export async function submitQuizResult(
  documentId: string,
  score: number,
  totalQuestions: number
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/quiz/submit",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        document_id: documentId,
        score: score,
        total_questions: totalQuestions,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save quiz result");
  }

  return response.json();
}

export type DashboardStats = {
  success: boolean;
  total_documents: number;
  total_quizzes: number;
  average_score: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/dashboard/stats",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return response.json();
}

export type QuizHistoryItem = {
  document_id: string;
  score: number;
  total_questions: number;
};

export async function getQuizHistory(): Promise<QuizHistoryItem[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    "http://127.0.0.1:8000/api/dashboard/quiz-history",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch quiz history");
  }

  const data = await response.json();

  return data.history;
}

export async function uploadPdf(file: File) {
  const token = localStorage.getItem("access_token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/api/upload-pdf",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "PDF upload failed");
  }

  return data;
}