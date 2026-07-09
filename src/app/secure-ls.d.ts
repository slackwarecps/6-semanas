declare module 'secure-ls' {
  export default class SecureLS {
    constructor(config?: any);
    set(key: string, value: any): void;
    get(key: string): any;
    remove(key: string): void;
    removeAll(): void;
    clear(): void;
  }
}
