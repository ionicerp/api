import { ICrudOperator } from "../interfaces/crud_operator";

export class DatabaseTable implements ICrudOperator {
    async create(data: any): Promise<any> {
        throw new Error('MasterDataTable not implemented.');
    }
}
