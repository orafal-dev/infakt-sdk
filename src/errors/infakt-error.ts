export type InfaktErrorDetails = {
  statusCode: number;
  code?: string;
  message?: string;
  errors?: unknown;
  rawBody?: string;
};

export class InfaktError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly errors?: unknown;
  readonly rawBody?: string;

  constructor(message: string, details: InfaktErrorDetails) {
    super(message);
    this.name = "InfaktError";
    this.statusCode = details.statusCode;
    this.code = details.code;
    this.errors = details.errors;
    this.rawBody = details.rawBody;
  }
}

export class InfaktApiError extends InfaktError {
  constructor(message: string, details: InfaktErrorDetails) {
    super(message, details);
    this.name = "InfaktApiError";
  }
}
