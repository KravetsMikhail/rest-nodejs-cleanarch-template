export interface IUseCase<IResponse> {
    execute(...args: any): Promise<IResponse> | IResponse
}