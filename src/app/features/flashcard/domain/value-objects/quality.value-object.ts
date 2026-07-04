export type QualityValue = 1 | 2 | 3 | 4;

export class Quality {
  readonly value: QualityValue;

  constructor(value: QualityValue) {
    if (value < 1 || value > 4) {
      throw new Error('Quality: value deve estar entre 1 (Again) e 4 (Easy).');
    }
    this.value = value;
  }

  get label(): 'Again' | 'Hard' | 'Good' | 'Easy' {
    switch (this.value) {
      case 1:
        return 'Again';
      case 2:
        return 'Hard';
      case 3:
        return 'Good';
      case 4:
        return 'Easy';
    }
  }
}
