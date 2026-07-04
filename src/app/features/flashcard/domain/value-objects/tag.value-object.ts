export class Tag {
  readonly name: string;

  constructor(name: string) {
    if (!name || !name.trim()) {
      throw new Error('Tag: name não pode ser vazio.');
    }
    this.name = name.trim();
  }

  equals(other: Tag): boolean {
    return this.name === other.name;
  }
}
