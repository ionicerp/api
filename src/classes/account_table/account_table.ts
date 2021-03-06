import { DatabaseTable } from '../database_table';

export class AccountTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.account.findUnique({
        where: {
          id: id
        }
      })
    } catch (e) { 
      return e;
    }
  }
  async list(condition: any, limit: number): Promise<any[] | any> {
    try {
      const accounts = await this.prisma.account.findMany({
        where: condition,
        take: limit
      });
      return accounts;
    } catch (e) {
      return e;
    }
  }
  async create(data: any): Promise<any> {
    try {
      const a = await this.prisma.account.create({
        data: data
      });
      return { id: a.id };
    } catch (e) {
      return e;
    }
  }
}