import { DatabaseTable } from '../database_table';

export class DeviceTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.device.findUnique({
        where: {
          id: id
        }
      })
    } catch (e) {
      return e;
    }
  }
  list(condition: any, limit: number): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async create(data: any): Promise<any> {
    try {
      return await this.prisma.device.create({
        data: data
      });
    } catch (e) {
      return e;
    }
  }

}