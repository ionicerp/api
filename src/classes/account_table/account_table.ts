import { PrismaClient } from '@prisma/client'
import { DatabaseTable } from "../database_table";
const prisma = new PrismaClient()

export class AccountTable extends DatabaseTable {
    override async create(data: any): Promise<any> {
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