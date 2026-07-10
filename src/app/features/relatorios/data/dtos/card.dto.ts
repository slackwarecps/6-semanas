export interface CardDTO {
  id: string;
  seq: number | null;
  title: string;
  question: string;
  answer: string;
  tags: string[];
}
