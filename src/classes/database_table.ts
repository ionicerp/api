import { PrismaClient } from '@prisma/client';
import { IGetOperation, IPostOperation } from '../interfaces/crud_operator';

export abstract class DatabaseTable implements IPostOperation, IGetOperation {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  abstract get(id: any): Promise<any>;
  abstract list(condition: any, limit: number): Promise<any[]>;
  abstract create(data: any): Promise<any>;
}
