import { DatabaseTable } from '../database_table';

export class ServiceOrderTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.service_order.findUnique({
        where: {
          id: id
        }
      })
    } catch (e) { 
      return e;
    }
  }
  async list(condition: any, limit: number): Promise<any> {
    return await this.prisma.service_order.findMany({
      where: {
        ...condition
      },
      take: limit
    });
  }
  async create(data: any): Promise<any> {
    try {
      return await this.prisma.service_order.create({
        data: data
      });
    } catch (e) {
      return e;
    }
  }

}