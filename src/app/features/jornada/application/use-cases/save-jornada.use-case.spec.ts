import { describe, beforeEach, it, expect, vi } from 'vitest';
import { SaveJornadaUseCase } from './save-jornada.use-case';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { JornadaProgressRepository } from '../../data/repositories/jornada-progress.repository';
import { Jornada } from '../../domain/entities/jornada.entity';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

describe('SaveJornadaUseCase', () => {
  let useCase: SaveJornadaUseCase;
  let mockJornadaRepo: any;
  let mockProgressRepo: any;

  beforeEach(() => {
    mockJornadaRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    mockProgressRepo = {
      getProgress: vi.fn(),
      saveProgress: vi.fn(),
      getTotalXp: vi.fn(),
      addXp: vi.fn(),
      resetAllProgress: vi.fn(),
    };

    useCase = new SaveJornadaUseCase(
      mockJornadaRepo as unknown as JornadaRepository,
      mockProgressRepo as unknown as JornadaProgressRepository
    );
  });

  it('deve salvar jornada nova com pontosTentativas e duração padrão', async () => {
    await useCase.execute({
      nome: 'Fase 1',
      ordem: 1,
      ativa: true,
      questionCardIds: ['card1', 'card2'],
    });

    expect(mockJornadaRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Fase 1',
        pontosTentativas: 3,
        duracao: 120,
        tipoJornada: 'normal',
      })
    );
  });

  it('deve salvar jornada editada mantendo pontosTentativas se não mudou', async () => {
    const existing = new Jornada({
      id: 'jornada-1',
      nome: 'Fase 1',
      ativa: true,
      ordem: 1,
      pontosTentativas: 5,
      questionCardIds: ['card1'],
      tipoJornada: 'normal',
      duracao: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockJornadaRepo.findById.mockResolvedValue(existing);
    mockProgressRepo.getProgress.mockResolvedValue(null);

    await useCase.execute({
      id: 'jornada-1',
      nome: 'Fase 1 Atualizada',
      ordem: 1,
      ativa: true,
      questionCardIds: ['card1'],
      // pontosTentativas não mudou
    });

    expect(mockProgressRepo.saveProgress).not.toHaveBeenCalled();
  });

  it('deve resetar progresso em andamento se pontosTentativas mudou', async () => {
    const existing = new Jornada({
      id: 'jornada-1',
      nome: 'Fase 1',
      ativa: true,
      ordem: 1,
      pontosTentativas: 3,
      questionCardIds: ['card1'],
      tipoJornada: 'normal',
      duracao: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const progress = new JornadaProgress({
      jornadaId: 'jornada-1',
      status: 'unlocked',
      currentQuestionIndex: 2,
      currentErrors: 1,
      currentLives: 2,
    });

    mockJornadaRepo.findById.mockResolvedValue(existing);
    mockProgressRepo.getProgress.mockResolvedValue(progress);

    await useCase.execute({
      id: 'jornada-1',
      nome: 'Fase 1',
      ordem: 1,
      ativa: true,
      pontosTentativas: 10, // Mudou de 3 para 10
      questionCardIds: ['card1'],
    });

    // Deve resetar o progresso com os novos pontosTentativas
    expect(mockProgressRepo.saveProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        jornadaId: 'jornada-1',
        status: 'unlocked',
        currentQuestionIndex: 0,
        currentErrors: 0,
        currentLives: 10,
      })
    );
  });

  it('não deve resetar progresso completado mesmo se pontosTentativas mudou', async () => {
    const existing = new Jornada({
      id: 'jornada-1',
      nome: 'Fase 1',
      ativa: true,
      ordem: 1,
      pontosTentativas: 3,
      questionCardIds: ['card1'],
      tipoJornada: 'normal',
      duracao: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const progress = new JornadaProgress({
      jornadaId: 'jornada-1',
      status: 'completed',
      bestErrors: 1,
      completedAt: new Date(),
      currentLives: 2,
    });

    mockJornadaRepo.findById.mockResolvedValue(existing);
    mockProgressRepo.getProgress.mockResolvedValue(progress);

    await useCase.execute({
      id: 'jornada-1',
      nome: 'Fase 1',
      ordem: 1,
      ativa: true,
      pontosTentativas: 10, // Mudou de 3 para 10
      questionCardIds: ['card1'],
    });

    // Não deve resetar o progresso já completado
    expect(mockProgressRepo.saveProgress).not.toHaveBeenCalled();
  });

  it('deve salvar jornada como Casa Desafio quando tipoJornada é "desafio"', async () => {
    await useCase.execute({
      nome: 'Desafio de Clean Architecture',
      ordem: 5,
      ativa: true,
      tipoJornada: 'desafio',
      duracao: 90,
      questionCardIds: ['card1', 'card2', 'card3'],
    });

    expect(mockJornadaRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Desafio de Clean Architecture',
        tipoJornada: 'desafio',
        duracao: 90,
      })
    );
  });

  it('deve preservar tipoJornada e duracao ao editar jornada desafio', async () => {
    const existing = new Jornada({
      id: 'jornada-1',
      nome: 'Desafio Antigo',
      ativa: true,
      ordem: 5,
      pontosTentativas: 3,
      questionCardIds: ['card1'],
      tipoJornada: 'desafio',
      duracao: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockJornadaRepo.findById.mockResolvedValue(existing);
    mockProgressRepo.getProgress.mockResolvedValue(null);

    await useCase.execute({
      id: 'jornada-1',
      nome: 'Desafio Novo',
      ordem: 5,
      ativa: true,
      questionCardIds: ['card1'],
      // tipoJornada e duracao não foram informados, devem usar os existentes
    });

    expect(mockJornadaRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoJornada: 'desafio',
        duracao: 90,
      })
    );
  });
});
