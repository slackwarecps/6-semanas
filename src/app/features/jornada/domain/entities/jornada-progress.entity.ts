export type JourneyProgressStatus = 'locked' | 'unlocked' | 'completed';

export interface JornadaProgressProps {
  jornadaId: string;
  status: JourneyProgressStatus;
  bestErrors: number | null;
  completedAt: Date | null;
}

export class JornadaProgress {
  readonly jornadaId: string;
  readonly status: JourneyProgressStatus;
  readonly bestErrors: number | null;
  readonly completedAt: Date | null;

  constructor(props: JornadaProgressProps) {
    this.jornadaId = props.jornadaId;
    this.status = props.status;
    this.bestErrors = props.bestErrors;
    this.completedAt = props.completedAt;
  }

  static createDefault(jornadaId: string, status: JourneyProgressStatus = 'locked'): JornadaProgress {
    return new JornadaProgress({
      jornadaId,
      status,
      bestErrors: null,
      completedAt: null
    });
  }
}
