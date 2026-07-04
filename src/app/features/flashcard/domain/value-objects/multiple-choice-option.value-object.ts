export interface MultipleChoiceOptionProps {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export class MultipleChoiceOption {
  readonly id: string;
  readonly text: string;
  readonly isCorrect: boolean;
  readonly order: number;

  constructor(props: MultipleChoiceOptionProps) {
    this.id = props.id;
    this.text = props.text;
    this.isCorrect = props.isCorrect;
    this.order = props.order;
  }
}
