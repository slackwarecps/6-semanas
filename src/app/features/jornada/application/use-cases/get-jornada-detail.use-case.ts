import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { Jornada } from '../../domain/entities/jornada.entity';

@Injectable({
  providedIn: 'root'
})
export class GetJornadaDetailUseCase {
  constructor(private repository: JornadaRepository) {}

  async execute(id: string): Promise<Jornada | null> {
    return await this.repository.findById(id);
  }
}
