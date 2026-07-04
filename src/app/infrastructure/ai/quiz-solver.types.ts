import { z } from 'zod';

export const CorrectOptionLetterSchema = z.enum(['A', 'B', 'C', 'D']);
export type CorrectOptionLetter = z.infer<typeof CorrectOptionLetterSchema>;

export const QuizAnswerSchema = z.object({
  correctOption: CorrectOptionLetterSchema.describe(
    "A letra da alternativa correta: 'A', 'B', 'C' ou 'D'."
  ),
  optionText: z.string().describe(
    'O texto completo da alternativa correta, exatamente como aparece na pergunta original.'
  ),
  justification: z.string().describe(
    'Breve justificativa (1-3 frases) do motivo pelo qual essa é a alternativa correta.'
  ),
});

export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;

export interface AnthropicQuizSolverConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
