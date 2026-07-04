import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteJornadaUseCase {
  constructor(private repository: JornadaRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
