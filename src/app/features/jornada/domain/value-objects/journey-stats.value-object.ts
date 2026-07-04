export class JourneyStats {
  readonly totalXp: number;
  readonly jornadasCompletadas: number;
  readonly totalJornadasAtivas: number;

  constructor(totalXp: number, jornadasCompletadas: number, totalJornadasAtivas: number) {
    this.totalXp = totalXp;
    this.jornadasCompletadas = jornadasCompletadas;
    this.totalJornadasAtivas = totalJornadasAtivas;
  }
}
