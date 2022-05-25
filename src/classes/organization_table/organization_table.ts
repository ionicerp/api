import { DatabaseTable } from '../database_table';

export class OrganizationTable extends DatabaseTable {
  async get(id: number): Promise<any> {
    try {
      return await this.prisma.organization.findUnique({
        where: {
          id: id
        }
      })
    } catch (e) {
      return e;
    }
  }
  async list(condition: any, limit: number): Promise<any> {
    return await this.prisma.organization.findMany({
      where: {
        ...condition
      },
      take: limit
    });
  }
  async create(data: any): Promise<any> {
    const count = await this.prisma.organization.count({
      where: {
        name: data.name
      }
    });
    if (count > 0) throw new Error('Organization already exists');
    const result = await this.prisma.organization.create({
      data: data
    });
    return { id: Number(result.id) };
  }

}