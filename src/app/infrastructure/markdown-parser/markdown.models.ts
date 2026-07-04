export interface ParsedOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface ParsedCard {
  title: string;
  question: string;
  options: ParsedOption[];
  tags: string[];
  correctOption?: string; // e.g. "A", "B", "C", "D"
  explanation?: string;
}
