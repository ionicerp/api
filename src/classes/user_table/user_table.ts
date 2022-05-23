import { DatabaseTable } from "../database_table";

export class UserTable extends DatabaseTable {
    async list(limit?: number): Promise<any[] | any> {
        return "Method not implemented.";
    }
    async get(id: any): Promise<any> {
        return "Method not implemented.";
    }
    async create(data: any): Promise<any> {
        return 'UserTable not implemented.';
    }
}