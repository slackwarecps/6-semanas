export type JourneyProgressStatus = 'locked' | 'unlocked' | 'completed';

export interface JornadaProgressProps {
  jornadaId: string;
  status: JourneyProgressStatus;
  bestErrors: number | null;
  completedAt: Date | null;
  currentQuestionIndex?: number;
  currentErrors?: number;
  currentLives?: number;
  lastActiveAt?: Date | null;
  bestTime?: number | null;
}

export class JornadaProgress {
  readonly jornadaId: string;
  readonly status: JourneyProgressStatus;
  readonly bestErrors: number | null;
  readonly completedAt: Date | null;
  readonly currentQuestionIndex: number;
  readonly currentErrors: number;
  readonly currentLives: number;
  readonly lastActiveAt: Date | null;
  readonly bestTime: number | null;

  constructor(props: JornadaProgressProps) {
    this.jornadaId = props.jornadaId;
    this.status = props.status;
    this.bestErrors = props.bestErrors;
    this.completedAt = props.completedAt;
    this.currentQuestionIndex = props.currentQuestionIndex ?? 0;
    this.currentErrors = props.currentErrors ?? 0;
    this.currentLives = props.currentLives ?? 3;
    this.lastActiveAt = props.lastActiveAt ?? null;
    this.bestTime = props.bestTime ?? null;
  }

  static createDefault(jornadaId: string, status: JourneyProgressStatus = 'locked'): JornadaProgress {
    return new JornadaProgress({
      jornadaId,
      status,
      bestErrors: null,
      completedAt: null,
      currentQuestionIndex: 0,
      currentErrors: 0,
      currentLives: 3,
      lastActiveAt: null,
      bestTime: null
    });
  }
}
