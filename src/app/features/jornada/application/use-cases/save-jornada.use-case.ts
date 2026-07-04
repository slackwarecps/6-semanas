import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { Jornada } from '../../domain/entities/jornada.entity';

export interface SaveJornadaInput {
  id?: string;
  nome: string;
  ordem: number;
  ativa: boolean;
  questionCardIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SaveJornadaUseCase {
  constructor(private repository: JornadaRepository) {}

  async execute(input: SaveJornadaInput): Promise<Jornada> {
    let jornada: Jornada;

    if (input.id) {
      const existing = await this.repository.findById(input.id);
      if (!existing) {
        throw new Error(`Jornada com ID ${input.id} não encontrada.`);
      }

      jornada = new Jornada({
        id: existing.id,
        nome: input.nome,
        ativa: input.ativa,
        ordem: input.ordem,
        questionCardIds: input.questionCardIds,
        createdAt: existing.createdAt,
        updatedAt: new Date()
      });
    } else {
      jornada = Jornada.create({
        nome: input.nome,
        ordem: input.ordem,
        questionCardIds: input.questionCardIds,
        ativa: input.ativa
      });
    }

    await this.repository.save(jornada);
    return jornada;
  }
}
