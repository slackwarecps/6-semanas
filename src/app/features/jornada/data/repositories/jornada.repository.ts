import { Injectable } from '@angular/core';
import { HttpJornadaAdapter } from '../../../../infrastructure/storage/http-jornada.adapter';
import { Jornada } from '../../domain/entities/jornada.entity';

@Injectable({
  providedIn: 'root'
})
export class JornadaRepository {
  constructor(private sqliteAdapter: HttpJornadaAdapter) {}

  async save(jornada: Jornada): Promise<void> {
    await this.sqliteAdapter.saveJornada(
      {
        id: jornada.id,
        nome: jornada.nome,
        ativa: jornada.ativa,
        ordem: jornada.ordem,
        pontosTentativas: jornada.pontosTentativas,
        tipoJornada: jornada.tipoJornada,
        duracao: jornada.duracao,
        createdAt: jornada.createdAt,
        updatedAt: jornada.updatedAt
      },
      jornada.questionCardIds
    );
  }

  async findAll(): Promise<Jornada[]> {
    const rows = await this.sqliteAdapter.loadAllJornadas();
    const jornadas: Jornada[] = [];
    for (const row of rows) {
      const cardIds = await this.sqliteAdapter.loadJornadaCardIds(row.id);
      jornadas.push(new Jornada({
        ...row,
        questionCardIds: cardIds
      }));
    }
    return jornadas;
  }

  async findById(id: string): Promise<Jornada | null> {
    const row = await this.sqliteAdapter.loadJornadaById(id);
    if (!row) return null;
    const cardIds = await this.sqliteAdapter.loadJornadaCardIds(id);
    return new Jornada({
      ...row,
      questionCardIds: cardIds
    });
  }

  async delete(id: string): Promise<void> {
    await this.sqliteAdapter.deleteJornada(id);
  }
}
