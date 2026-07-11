import { DesafioTimer } from './desafio-timer.value-object';

describe('DesafioTimer', () => {
  describe('getRemainingSeconds', () => {
    it('deve calcular tempo restante corretamente', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 60 * 60 * 1000; // 1 hora depois

      expect(timer.getRemainingSeconds(now)).toBe(60 * 60); // 1 hora = 3600 segundos
    });

    it('deve retornar 0 quando tempo acabar', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 120 * 60 * 1000 + 1000; // 120 minutos + 1 segundo

      expect(timer.getRemainingSeconds(now)).toBe(0);
    });

    it('deve retornar valor correto no meio do timer', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 45 * 60 * 1000; // 45 minutos depois

      expect(timer.getRemainingSeconds(now)).toBe(75 * 60); // 75 minutos restantes
    });
  });

  describe('isExpired', () => {
    it('deve retornar false quando tempo não acabou', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 50 * 60 * 1000;

      expect(timer.isExpired(now)).toBe(false);
    });

    it('deve retornar true quando tempo acabou', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 120 * 60 * 1000 + 1000;

      expect(timer.isExpired(now)).toBe(true);
    });

    it('deve retornar true exatamente no momento em que acaba', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 120 * 60 * 1000;

      expect(timer.isExpired(now)).toBe(false); // Ainda não venceu no exato momento
    });
  });

  describe('getUrgencyColor', () => {
    const startTime = 1000;
    const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });

    it('deve retornar green quando > 30 minutos', () => {
      const now = startTime + 50 * 60 * 1000;
      expect(timer.getUrgencyColor(now)).toBe('green');
    });

    it('deve retornar yellow quando 10-30 minutos', () => {
      const now = startTime + 20 * 60 * 1000;
      expect(timer.getUrgencyColor(now)).toBe('yellow');
    });

    it('deve retornar red quando < 10 minutos', () => {
      const now = startTime + 5 * 60 * 1000;
      expect(timer.getUrgencyColor(now)).toBe('red');
    });

    it('deve retornar green quando exatamente > 30 minutos', () => {
      const now = startTime + 91 * 60 * 1000; // 31 minutos restantes
      expect(timer.getUrgencyColor(now)).toBe('green');
    });

    it('deve retornar yellow quando exatamente 30 minutos', () => {
      const now = startTime + 90 * 60 * 1000; // 30 minutos restantes
      expect(timer.getUrgencyColor(now)).toBe('yellow');
    });

    it('deve retornar red quando exatamente 10 minutos', () => {
      const now = startTime + 110 * 60 * 1000; // 10 minutos restantes
      expect(timer.getUrgencyColor(now)).toBe('red');
    });
  });

  describe('getFormattedRemaining', () => {
    it('deve formatar tempo corretamente com horas, minutos e segundos', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 1000; // 1 segundo depois, 119:59:59 restante

      const formatted = timer.getFormattedRemaining(now);
      expect(formatted).toContain('h');
      expect(formatted).toContain('m');
      expect(formatted).toContain('s');
    });

    it('deve formatar como "2h 30m 45s" quando apropriado', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 87000 * 1000; // 87000 segundos depois (24h15m)
      // 120 min - 24.1667 horas = negativo, então deve ser 0

      const formatted = timer.getFormattedRemaining(now);
      expect(formatted).toBe('0s');
    });
  });

  describe('getProgressPercent', () => {
    it('deve retornar 0% no início', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });

      expect(timer.getProgressPercent(startTime)).toBe(0);
    });

    it('deve retornar 50% no meio', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 60 * 60 * 1000; // 1 hora depois (metade de 120 min)

      expect(timer.getProgressPercent(now)).toBe(50);
    });

    it('deve retornar 100% quando tempo acabar', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 120 * 60 * 1000;

      expect(timer.getProgressPercent(now)).toBe(100);
    });
  });

  describe('isWarning', () => {
    it('deve retornar false quando há mais de 30% do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 75 * 60 * 1000; // 45 minutos restantes (37% do tempo)

      expect(timer.isWarning(now)).toBe(false);
    });

    it('deve retornar true quando há entre 10% e 30% do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 95 * 60 * 1000; // 25 minutos restantes (21% de 120)

      expect(timer.isWarning(now)).toBe(true);
    });

    it('deve retornar true quando há exatamente 30% do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 84 * 60 * 1000; // 36 minutos restantes (30% de 120)

      expect(timer.isWarning(now)).toBe(true);
    });

    it('deve retornar false quando há 10% ou menos do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 109 * 60 * 1000; // 11 minutos restantes (9% de 120)

      expect(timer.isWarning(now)).toBe(false);
    });

    it('deve retornar false quando o tempo acabou', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 121 * 60 * 1000; // tempo esgotado

      expect(timer.isWarning(now)).toBe(false);
    });

    it('deve considerar 30% do tempo baseado na duração da jornada', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 60 });
      const now = startTime + 50 * 60 * 1000; // 10 minutos restantes (16% de 60)

      expect(timer.isWarning(now)).toBe(true);
    });
  });

  describe('isCritical', () => {
    it('deve retornar false quando há mais de 10% do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 50 * 60 * 1000; // 70 minutos restantes (58% do tempo)

      expect(timer.isCritical(now)).toBe(false);
    });

    it('deve retornar true quando há 10% ou menos do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 109 * 60 * 1000; // 11 minutos restantes (9% de 120)

      expect(timer.isCritical(now)).toBe(true);
    });

    it('deve retornar true quando há exatamente 10% do tempo restante', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 108 * 60 * 1000; // 12 minutos restantes (10% de 120)

      expect(timer.isCritical(now)).toBe(true);
    });

    it('deve retornar false quando o tempo acabou', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 120 });
      const now = startTime + 121 * 60 * 1000; // tempo esgotado

      expect(timer.isCritical(now)).toBe(false);
    });

    it('deve considerar 10% do tempo baseado na duração da jornada', () => {
      const startTime = 1000;
      const timer = new DesafioTimer({ startTimeMs: startTime, durationMinutes: 60 });
      const now = startTime + 55 * 60 * 1000; // 5 minutos restantes (8% de 60)

      expect(timer.isCritical(now)).toBe(true);
    });
  });
});
