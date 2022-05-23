import { PrismaClient } from '@prisma/client'
import { DatabaseTable } from "../database_table";
const prisma = new PrismaClient()

export class AccountTable extends DatabaseTable {
    async get(id: any): Promise<any> {
        return 'Method not implemented.';
    }
    async list(limit?: number): Promise<any[] | any> {
        try {
            const accounts = await prisma.accounts.findMany({
                take: limit
            });
            return accounts;
        } catch (e: any) {
            return e.message;
        }
    }
    async create(data: any): Promise<any> {
        const { username, password, email } = data;
        try {
            const a = await prisma.accounts.create({
                data: {
                    username,
                    password,
                    email
                }
            });
            return a.user_id;
        } catch (e: any) {
            return e.message;
        }
    }
}