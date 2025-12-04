export interface IApiClient {
  getLocations(): Promise<any[]>;
  getTariffs(): Promise<any[]>;
  authorize(token: string): Promise<boolean>;
}
