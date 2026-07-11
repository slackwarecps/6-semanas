import { Injectable } from '@angular/core';
import { Question } from '../../domain/question.entity';
import { QuestionsRepository } from '../../data/repositories/questions.repository';

@Injectable({ providedIn: 'root' })
export class GetUnclassifiedQuestionsUseCase {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(): Promise<Question[]> {
    return this.questionsRepository.getUnclassifiedQuestions();
  }
}
