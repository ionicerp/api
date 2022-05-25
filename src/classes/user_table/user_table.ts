import { DatabaseTable } from '../database_table';

export class UserTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id: id
        }
      });
    } catch (e) {
      return e;
    }
  }
  async list(condition: any, limit: number): Promise<any[] | any> {
    try {
      const accounts = await this.prisma.user.findMany({
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
      const record = await this.prisma.user.create({
        data: data
      });
      return { id: Number(record.id) }
    } catch (e) {
      return e;
    }
  }
}