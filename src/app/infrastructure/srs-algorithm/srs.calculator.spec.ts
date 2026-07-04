import { describe, it, expect } from 'vitest';
import { SRSCalculator } from './srs.calculator';
import { Quality } from '../../features/flashcard/domain/value-objects/quality.value-object';
import { Interval } from '../../features/flashcard/domain/value-objects/interval.value-object';
import { EaseFactor } from '../../features/flashcard/domain/value-objects/ease-factor.value-object';

describe('SRSCalculator', () => {
  const calculator = new SRSCalculator();

  describe('calculateNextInterval', () => {
    it('should reset interval to 1 day if quality is less than 3 (Again/1 or Hard/2)', () => {
      const qAgain = new Quality(1);
      const qHardErr = new Quality(2);
      const currentInterval = new Interval(10);
      const repetitions = 3;
      const easeFactor = new EaseFactor(2.5);

      expect(calculator.calculateNextInterval(qAgain, currentInterval, repetitions, easeFactor).days).toBe(1);
      expect(calculator.calculateNextInterval(qHardErr, currentInterval, repetitions, easeFactor).days).toBe(1);
    });

    it('should return 1 day on the first repetition (repetitions = 0)', () => {
      const qGood = new Quality(3);
      const currentInterval = new Interval(0);
      const repetitions = 0;
      const easeFactor = new EaseFactor(2.5);

      const next = calculator.calculateNextInterval(qGood, currentInterval, repetitions, easeFactor);
      expect(next.days).toBe(1);
    });

    it('should return 3 days on the second repetition (repetitions = 1)', () => {
      const qGood = new Quality(3);
      const currentInterval = new Interval(1);
      const repetitions = 1;
      const easeFactor = new EaseFactor(2.5);

      const next = calculator.calculateNextInterval(qGood, currentInterval, repetitions, easeFactor);
      expect(next.days).toBe(3);
    });

    it('should multiply the current interval by the ease factor for repetitions > 1', () => {
      const qGood = new Quality(3);
      const currentInterval = new Interval(3);
      const repetitions = 2;
      const easeFactor = new EaseFactor(2.5);

      const next = calculator.calculateNextInterval(qGood, currentInterval, repetitions, easeFactor);
      // Math.ceil(3 * 2.5) = Math.ceil(7.5) = 8
      expect(next.days).toBe(8);
    });
  });

  describe('calculateNextEaseFactor', () => {
    it('should update ease factor based on SM-2 formula and clamp between 1.3 and 5.0', () => {
      const currentEF = new EaseFactor(2.5);

      // q = 4 (Easy)
      // delta = 0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02) = 0.1 - 1 * 0.10 = 0.0
      // EF' = 2.5 + 0.0 = 2.5
      expect(calculator.calculateNextEaseFactor(new Quality(4), currentEF).value).toBe(2.5);

      // q = 3 (Good)
      // delta = 0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02) = 0.1 - 2 * 0.12 = 0.1 - 0.24 = -0.14
      // EF' = 2.5 - 0.14 = 2.36
      expect(calculator.calculateNextEaseFactor(new Quality(3), currentEF).value).toBe(2.36);

      // Teste limite mínimo de 1.3
      const lowEF = new EaseFactor(1.35);
      const nextEF = calculator.calculateNextEaseFactor(new Quality(1), lowEF);
      expect(nextEF.value).toBe(1.3); // Clamped a 1.3
    });
  });

  describe('determineCardState', () => {
    it('should return Relearning if quality is less than 3', () => {
      expect(calculator.determineCardState(new Quality(1), 'Review', 3)).toBe('Relearning');
      expect(calculator.determineCardState(new Quality(2), 'Learning', 1)).toBe('Relearning');
    });

    it('should transit state appropriately when response is correct', () => {
      // De New para Learning
      expect(calculator.determineCardState(new Quality(3), 'New', 1)).toBe('Learning');
      
      // De New para Review se ja tem mais de 2 repeticoes
      expect(calculator.determineCardState(new Quality(3), 'New', 2)).toBe('Review');

      // De Learning para Review se atingir repetitions >= 2
      expect(calculator.determineCardState(new Quality(3), 'Learning', 2)).toBe('Review');
      
      // Mantem em Learning se repetitions < 2
      expect(calculator.determineCardState(new Quality(3), 'Learning', 1)).toBe('Learning');

      // Sempre move para Review se ja estiver em Review ou Relearning
      expect(calculator.determineCardState(new Quality(3), 'Review', 1)).toBe('Review');
      expect(calculator.determineCardState(new Quality(3), 'Relearning', 1)).toBe('Review');
    });
  });
});
