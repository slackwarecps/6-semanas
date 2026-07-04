import { Quality } from '../value-objects/quality.value-object';
import { EaseFactor } from '../value-objects/ease-factor.value-object';
import { Interval } from '../value-objects/interval.value-object';

export interface AttemptProps {
  timestamp: Date;
  quality: Quality;
  elapsedTime: number;
  wasCorrect: boolean;
  userAnswer?: string;
  easeFactorBefore: EaseFactor;
  easeFactorAfter: EaseFactor;
  intervalBefore: Interval;
  intervalAfter: Interval;
}

export class Attempt {
  readonly timestamp: Date;
  readonly quality: Quality;
  readonly elapsedTime: number;
  readonly wasCorrect: boolean;
  readonly userAnswer?: string;
  readonly easeFactorBefore: EaseFactor;
  readonly easeFactorAfter: EaseFactor;
  readonly intervalBefore: Interval;
  readonly intervalAfter: Interval;

  constructor(props: AttemptProps) {
    this.timestamp = props.timestamp;
    this.quality = props.quality;
    this.elapsedTime = props.elapsedTime;
    this.wasCorrect = props.wasCorrect;
    this.userAnswer = props.userAnswer;
    this.easeFactorBefore = props.easeFactorBefore;
    this.easeFactorAfter = props.easeFactorAfter;
    this.intervalBefore = props.intervalBefore;
    this.intervalAfter = props.intervalAfter;
  }
}
