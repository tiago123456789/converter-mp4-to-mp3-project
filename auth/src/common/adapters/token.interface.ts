export interface TokenPayload {
  id: number;
}

export interface TokenInterface {
  get(payload: TokenPayload): Promise<string>;
  isValid(token: string): Promise<TokenPayload | boolean>;
}
