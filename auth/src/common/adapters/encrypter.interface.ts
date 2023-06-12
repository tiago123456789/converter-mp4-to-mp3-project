export interface EncrypterInterface {
  hash(plainText: string): Promise<string>;
  compare(hash: string, plainText: string): Promise<boolean>;
}
