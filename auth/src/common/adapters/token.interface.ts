export interface TokenPayload {
  id: number;
  email: string;
}

export interface TokenInterface {
  get(payload: TokenPayload): Promise<string>;
  isValid(token: string): Promise<TokenPayload | boolean>;
}
