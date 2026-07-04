export class Interval {
  readonly days: number;

  constructor(days: number) {
    if (days < 0) {
      throw new Error('Interval: days não pode ser negativo.');
    }
    this.days = days;
  }
}
