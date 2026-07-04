export class EaseFactor {
  static readonly MIN = 1.3;
  static readonly MAX = 5.0;
  static readonly DEFAULT = 2.5;

  readonly value: number;

  constructor(value: number) {
    const rounded = Math.round(value * 100) / 100;
    this.value = Math.min(EaseFactor.MAX, Math.max(EaseFactor.MIN, rounded));
  }
}
