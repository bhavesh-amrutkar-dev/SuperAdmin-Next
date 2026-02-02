export interface IAPIResponse<T = unknown> {
  isSuccess: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}
