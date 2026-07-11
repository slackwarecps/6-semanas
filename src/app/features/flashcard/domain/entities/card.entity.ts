import { CardId } from '../value-objects/card-id.value-object';
import { EaseFactor } from '../value-objects/ease-factor.value-object';
import { Interval } from '../value-objects/interval.value-object';
import { MultipleChoiceOption } from '../value-objects/multiple-choice-option.value-object';
import { Tag } from '../value-objects/tag.value-object';
import { Attempt } from './attempt.entity';

export type ReviewState = 'New' | 'Learning' | 'Review' | 'Relearning';

export interface CardProps {
  id: CardId;
  seq?: number;
  title: string;
  question: string;
  answer: string;
  options?: MultipleChoiceOption[];
  tags: Tag[];
  state: ReviewState;
  interval: Interval;
  easeFactor: EaseFactor;
  repetitions: number;
  attempts: Attempt[];
  createdAt: Date;
  updatedAt: Date;
  nextReviewDate: Date;
  traducao?: string;
  explanation?: string;
  tenYearOld?: string;
  flagged?: boolean;
}

export interface NewCardProps {
  title: string;
  question: string;
  answer: string;
  options?: MultipleChoiceOption[];
  tags?: Tag[];
  traducao?: string;
  explanation?: string;
  tenYearOld?: string;
  flagged?: boolean;
}

export class Card {
  readonly id: CardId;
  readonly seq?: number;
  readonly title: string;
  readonly question: string;
  readonly answer: string;
  readonly options?: MultipleChoiceOption[];
  readonly tags: Tag[];
  readonly state: ReviewState;
  readonly interval: Interval;
  readonly easeFactor: EaseFactor;
  readonly repetitions: number;
  readonly attempts: Attempt[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly nextReviewDate: Date;
  readonly traducao?: string;
  readonly explanation?: string;
  readonly tenYearOld?: string;
  readonly flagged?: boolean;

  constructor(props: CardProps) {
    this.id = props.id;
    this.seq = props.seq;
    this.title = props.title;
    this.question = props.question;
    this.answer = props.answer;
    this.options = props.options;
    this.tags = props.tags;
    this.state = props.state;
    this.interval = props.interval;
    this.easeFactor = props.easeFactor;
    this.repetitions = props.repetitions;
    this.attempts = props.attempts;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.nextReviewDate = props.nextReviewDate;
    this.traducao = props.traducao;
    this.explanation = props.explanation;
    this.tenYearOld = props.tenYearOld;
    this.flagged = props.flagged;
  }

  static create(props: NewCardProps): Card {
    const now = new Date();
    return new Card({
      id: CardId.generate(),
      title: props.title,
      question: props.question,
      answer: props.answer,
      options: props.options,
      tags: props.tags ?? [],
      state: 'New',
      interval: new Interval(0),
      easeFactor: new EaseFactor(EaseFactor.DEFAULT),
      repetitions: 0,
      attempts: [],
      createdAt: now,
      updatedAt: now,
      nextReviewDate: now,
      traducao: props.traducao,
      explanation: props.explanation,
      tenYearOld: props.tenYearOld,
      flagged: props.flagged,
    });
  }

  get isDue(): boolean {
    return this.nextReviewDate.getTime() <= Date.now();
  }

  get isMultipleChoice(): boolean {
    return !!this.options && this.options.length > 0;
  }
}
