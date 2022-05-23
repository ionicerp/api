export interface IPostOperation {
    create(data: any): Promise<any>;
}

export interface IGetOperation {
    get(id: any): Promise<any>;
    list(limit?: number): Promise<any[] | any>;
}