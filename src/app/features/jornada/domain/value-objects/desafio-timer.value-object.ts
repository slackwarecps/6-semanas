export interface DesafioTimerProps {
  startTimeMs: number;
  durationMinutes: number;
}

export class DesafioTimer {
  readonly startTimeMs: number;
  readonly durationMinutes: number;
  readonly durationMs: number;

  constructor(props: DesafioTimerProps) {
    if (props.durationMinutes <= 0) {
      throw new Error('Duração do desafio deve ser maior que 0 minutos');
    }
    this.startTimeMs = props.startTimeMs;
    this.durationMinutes = props.durationMinutes;
    this.durationMs = props.durationMinutes * 60 * 1000;
  }

  getElapsedMs(nowMs: number = Date.now()): number {
    return Math.max(0, nowMs - this.startTimeMs);
  }

  getRemainingMs(nowMs: number = Date.now()): number {
    return Math.max(0, this.durationMs - this.getElapsedMs(nowMs));
  }

  getRemainingSeconds(nowMs: number = Date.now()): number {
    return Math.floor(this.getRemainingMs(nowMs) / 1000);
  }

  getProgressPercent(nowMs: number = Date.now()): number {
    const elapsed = this.getElapsedMs(nowMs);
    return Math.min(100, Math.round((elapsed / this.durationMs) * 100));
  }

  isExpired(nowMs: number = Date.now()): boolean {
    return this.getRemainingMs(nowMs) <= 0;
  }

  getFormattedRemaining(nowMs: number = Date.now()): string {
    const secondsRemaining = this.getRemainingSeconds(nowMs);
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${String(minutes).padStart(2, '0')}m`);
    parts.push(`${String(seconds).padStart(2, '0')}s`);

    return parts.join(' ');
  }

  getUrgencyColor(nowMs: number = Date.now()): 'green' | 'yellow' | 'red' {
    const remainingMinutes = this.getRemainingSeconds(nowMs) / 60;
    if (remainingMinutes > 30) return 'green';
    if (remainingMinutes > 10) return 'yellow';
    return 'red';
  }

  isWarning(nowMs: number = Date.now()): boolean {
    const remainingMinutes = this.getRemainingSeconds(nowMs) / 60;
    const warningThreshold = this.durationMinutes * 0.3;
    const criticalThreshold = this.durationMinutes * 0.1;
    return remainingMinutes <= warningThreshold && remainingMinutes > criticalThreshold;
  }

  isCritical(nowMs: number = Date.now()): boolean {
    const remainingMinutes = this.getRemainingSeconds(nowMs) / 60;
    const criticalThreshold = this.durationMinutes * 0.1;
    return remainingMinutes <= criticalThreshold && remainingMinutes > 0;
  }
}
