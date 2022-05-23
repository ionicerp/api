import { IGetOperation, IPostOperation } from "../interfaces/crud_operator";

export abstract class DatabaseTable implements IPostOperation, IGetOperation {
    abstract get(id: any): Promise<any>;
    abstract list(limit?: number): Promise<any[] | any>;
    abstract create(data: any): Promise<any>;
}
