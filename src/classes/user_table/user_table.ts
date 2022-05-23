import { DatabaseTable } from "../database_table";

export class UserTable extends DatabaseTable {
    override async create(data: any): Promise<any> {
        return 'UserTable not implemented.';
    }
}