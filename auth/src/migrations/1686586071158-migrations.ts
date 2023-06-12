import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1686586071158 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            email VARCHAR(150) NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.query(`
        DROP TABLE IF EXISTS users
    `);
  }
}
