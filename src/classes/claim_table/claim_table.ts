import { DatabaseTable } from '../database_table';

export class ClaimTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.claim.findUnique({
        where: {
          id: id
        }
      })
    } catch (e) { 
      return e;
    }
  }
  async list(condition: any | undefined, limit: number): Promise<any[] | any> {
    try {
      const accounts = await this.prisma.claim.findMany({
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
      return await this.prisma.claim.create({
        data: data
      });
    } catch (e) {
      return e;
    }
  }

}