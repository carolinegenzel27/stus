export type Locale = "en" | "he";

export type Profile = {
  id: string;
  username: string;
  student_type: string | null;
  year: string | null;
  field: string | null;
  goals: string[];
  locale: Locale;
  onboarded: boolean;
};

export type Course = {
  id: string;
  name: string;
  emoji: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Material = {
  id: string;
  course_id: string;
  title: string;
  kind: "pdf" | "txt" | "text";
  char_count: number;
  selected: boolean;
  created_at: string;
};

export type Folder = { id: string; course_id: string; name: string; created_at: string };

export type ProductType = "summary" | "flashcards" | "test" | "chat";

export type SummaryOptions = { style: "short" | "keywords" | "detailed"; notes?: string };
export type FlashcardOptions = { target?: string; count: number };
export type QuestionKind = "yesno" | "mc" | "open";
export type TestOptions = {
  count: 5 | 10 | 20;
  difficulty: "easy" | "medium" | "hard";
  kinds: QuestionKind[];
};

export type SummaryContent = { markdown: string };
export type Flashcard = { front: string; back: string };
export type FlashcardContent = { cards: Flashcard[] };
export type TestQuestion = {
  kind: QuestionKind;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};
export type TestResult = {
  answers: string[];
  correct: boolean[];
  feedback: string[];
  score: number;
  submitted_at: string;
};
export type TestContent = { questions: TestQuestion[]; result?: TestResult };
export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatContent = { messages: ChatMessage[] };

export type Product = {
  id: string;
  course_id: string;
  folder_id: string | null;
  type: ProductType;
  title: string;
  options: Record<string, unknown>;
  content: SummaryContent | FlashcardContent | TestContent | ChatContent;
  material_ids: string[];
  created_at: string;
};
