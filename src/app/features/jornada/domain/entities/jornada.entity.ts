export interface JornadaProps {
  id: string;
  nome: string;
  ativa: boolean;
  ordem: number;
  pontosTentativas: number;
  questionCardIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Jornada {
  readonly id: string;
  readonly nome: string;
  readonly ativa: boolean;
  readonly ordem: number;
  readonly pontosTentativas: number;
  readonly questionCardIds: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: JornadaProps) {
    this.id = props.id;
    this.nome = props.nome;
    this.ativa = props.ativa;
    this.ordem = props.ordem;
    this.pontosTentativas = props.pontosTentativas;
    this.questionCardIds = props.questionCardIds;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: { nome: string; ordem: number; pontosTentativas?: number; questionCardIds?: string[]; ativa?: boolean }): Jornada {
    const now = new Date();
    return new Jornada({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      nome: props.nome,
      ativa: props.ativa ?? false,
      ordem: props.ordem,
      pontosTentativas: props.pontosTentativas ?? 3,
      questionCardIds: props.questionCardIds ?? [],
      createdAt: now,
      updatedAt: now
    });
  }
}
