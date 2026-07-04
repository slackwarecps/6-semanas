import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { Jornada } from '../../domain/entities/jornada.entity';

@Injectable({
  providedIn: 'root'
})
export class ListJornadasUseCase {
  constructor(private repository: JornadaRepository) {}

  async execute(): Promise<Jornada[]> {
    return await this.repository.findAll();
  }
}
