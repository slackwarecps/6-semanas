import { ChatAnthropic } from '@langchain/anthropic';
import {
  AnthropicQuizSolverConfig,
  QuizAnswer,
  QuizAnswerSchema,
} from './quiz-solver.types';

const DEFAULT_MODEL = 'claude-sonnet-5';
const DEFAULT_TEMPERATURE = 0;
const DEFAULT_MAX_TOKENS = 1024;

export class AnthropicQuizSolver {
  private readonly model: ChatAnthropic;

  constructor(config: AnthropicQuizSolverConfig) {
    if (!config.apiKey) {
      throw new Error('AnthropicQuizSolver: "apiKey" é obrigatório.');
    }

    this.model = new ChatAnthropic({
      apiKey: config.apiKey,
      model: config.model ?? DEFAULT_MODEL,
      temperature: config.temperature ?? DEFAULT_TEMPERATURE,
      maxTokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
    });
  }

  async solve(questionText: string): Promise<QuizAnswer> {
    if (!questionText?.trim()) {
      throw new Error('AnthropicQuizSolver.solve: "questionText" não pode ser vazio.');
    }

    const structuredModel = this.model.withStructuredOutput(QuizAnswerSchema, {
      name: 'quiz_answer',
    });

    const prompt =
      'Você recebe abaixo uma pergunta de múltipla escolha (formato de um app de flashcards ' +
      'de estudo), contendo título, enunciado e alternativas (linhas prefixadas por ' +
      '"[ ] A -", "[ ] B -", etc). Analise com cuidado e determine a única alternativa correta.\n\n' +
      questionText;

    return structuredModel.invoke(prompt);
  }
}
