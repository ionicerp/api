import { DatabaseTable } from '../database_table';

export class BusinessUnitTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.business_unit.findUnique({
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
      const accounts = await this.prisma.business_unit.findMany({
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
      return await this.prisma.business_unit.create({
        data: data
      });
    } catch (e) {
      return e;
    }
  }

}