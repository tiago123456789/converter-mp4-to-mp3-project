export interface UserRepositoryInterface<T> {
  findByEmail(email: string): Promise<T>;
}
