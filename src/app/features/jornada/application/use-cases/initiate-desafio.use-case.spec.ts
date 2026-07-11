import { InitiateDesafioUseCase } from './initiate-desafio.use-case';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { DesafioTimer } from '../../domain/value-objects/desafio-timer.value-object';

describe('InitiateDesafioUseCase', () => {
  let useCase: InitiateDesafioUseCase;
  let progressRepositoryMock: Partial<JornadaProgressRepository>;

  beforeEach(() => {
    progressRepositoryMock = {
      getProgress: jasmine.createSpy('getProgress').and.returnValue(Promise.resolve(null)),
      saveProgress: jasmine.createSpy('saveProgress').and.returnValue(Promise.resolve())
    };

    useCase = new InitiateDesafioUseCase(progressRepositoryMock as JornadaProgressRepository);
  });

  it('deve criar um DesafioTimer com duração parametrizada', async () => {
    const jornadaId = 'jornada-1';
    const beforeTime = Date.now();
    const timer = await useCase.execute(jornadaId, 60);
    const afterTime = Date.now();

    expect(timer).toBeInstanceOf(DesafioTimer);
    expect(timer.durationMinutes).toBe(60);
    expect(timer.startTimeMs).toBeGreaterThanOrEqual(beforeTime);
    expect(timer.startTimeMs).toBeLessThanOrEqual(afterTime);
  });

  it('deve usar duração padrão de 120 minutos quando não informada', async () => {
    const jornadaId = 'jornada-1';
    const timer = await useCase.execute(jornadaId);

    expect(timer.durationMinutes).toBe(120);
  });

  it('deve recuperar startTimeMs se houver progresso anterior (cenário: usuário saiu e voltou)', async () => {
    const jornadaId = 'jornada-1';
    const previousStartTime = Date.now() - 3 * 60 * 1000; // Começou 3 minutos atrás

    const previousProgress = new JornadaProgress({
      jornadaId,
      status: 'unlocked',
      bestErrors: null,
      completedAt: null,
      currentQuestionIndex: 5,
      currentErrors: 1,
      currentLives: 2,
      lastActiveAt: new Date(),
      desafioStartTimeMs: previousStartTime
    });

    (progressRepositoryMock.getProgress as jasmine.Spy).and.returnValue(
      Promise.resolve(previousProgress)
    );

    const timer = await useCase.execute(jornadaId, 6);

    // O timer deve usar o startTime antigo, não criar um novo
    expect(timer.startTimeMs).toBe(previousStartTime);

    // O tempo restante deve ser ~3 minutos (6 - 3)
    const remainingMinutes = timer.getRemainingSeconds() / 60;
    expect(remainingMinutes).toBeLessThan(3.5);
    expect(remainingMinutes).toBeGreaterThan(2.5);
  });

  it('deve salvar o desafioStartTimeMs no progresso', async () => {
    const jornadaId = 'jornada-1';

    await useCase.execute(jornadaId, 120);

    expect(progressRepositoryMock.saveProgress).toHaveBeenCalled();

    const savedProgress = (progressRepositoryMock.saveProgress as jasmine.Spy).calls.mostRecent()
      .args[0] as JornadaProgress;

    expect(savedProgress.desafioStartTimeMs).toBeTruthy();
    expect(savedProgress.desafioStartTimeMs).toBeGreaterThan(0);
  });

  it('deve preservar outros campos do progresso ao atualizar startTime', async () => {
    const jornadaId = 'jornada-1';
    const previousProgress = new JornadaProgress({
      jornadaId,
      status: 'unlocked',
      bestErrors: 2,
      completedAt: null,
      currentQuestionIndex: 3,
      currentErrors: 1,
      currentLives: 2,
      lastActiveAt: new Date(),
      desafioStartTimeMs: Date.now()
    });

    (progressRepositoryMock.getProgress as jasmine.Spy).and.returnValue(
      Promise.resolve(previousProgress)
    );

    await useCase.execute(jornadaId, 120);

    const savedProgress = (progressRepositoryMock.saveProgress as jasmine.Spy).calls.mostRecent()
      .args[0] as JornadaProgress;

    expect(savedProgress.status).toBe('unlocked');
    expect(savedProgress.bestErrors).toBe(2);
    expect(savedProgress.currentQuestionIndex).toBe(3);
  });

  it('deve criar novo startTimeMs se progresso não tiver desafioStartTimeMs', async () => {
    const jornadaId = 'jornada-1';
    const progressWithoutTimer = new JornadaProgress({
      jornadaId,
      status: 'unlocked',
      bestErrors: null,
      completedAt: null,
      currentQuestionIndex: 0,
      currentErrors: 0,
      currentLives: 3
      // desafioStartTimeMs: undefined
    });

    (progressRepositoryMock.getProgress as jasmine.Spy).and.returnValue(
      Promise.resolve(progressWithoutTimer)
    );

    const beforeTime = Date.now();
    const timer = await useCase.execute(jornadaId, 120);
    const afterTime = Date.now();

    expect(timer.startTimeMs).toBeGreaterThanOrEqual(beforeTime);
    expect(timer.startTimeMs).toBeLessThanOrEqual(afterTime);
  });

  it('cenário completo: usuário estuda 2 min de 6, sai, volta e continua com 4 min restantes', async () => {
    const jornadaId = 'jornada-1';

    // Simulação 1: Usuário entra no desafio
    const timer1 = await useCase.execute(jornadaId, 6);
    const startTime = timer1.startTimeMs;

    // Simula que se passaram 2 minutos
    const after2MinutesMock = startTime + 2 * 60 * 1000;
    expect(timer1.getRemainingSeconds(after2MinutesMock)).toBe(4 * 60); // 4 minutos restantes

    // Salva a sessão com startTime preservado
    const progressAfter2Min = new JornadaProgress({
      jornadaId,
      status: 'unlocked',
      bestErrors: null,
      completedAt: null,
      currentQuestionIndex: 2,
      currentErrors: 0,
      currentLives: 3,
      lastActiveAt: new Date(),
      desafioStartTimeMs: startTime // Preserva o startTime original
    });

    (progressRepositoryMock.getProgress as jasmine.Spy).and.returnValue(
      Promise.resolve(progressAfter2Min)
    );

    // Simulação 2: Usuário volta ao desafio
    const timer2 = await useCase.execute(jornadaId, 6);

    // O timer deve começar com o mesmo startTime
    expect(timer2.startTimeMs).toBe(startTime);

    // E mostrar ~4 minutos restantes (é como se o tempo tivesse parado)
    expect(timer2.getRemainingSeconds(after2MinutesMock)).toBe(4 * 60);
  });
});
