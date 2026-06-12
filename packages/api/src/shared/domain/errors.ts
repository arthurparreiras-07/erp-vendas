export class DomainError extends Error {
  constructor(message: string, public readonly statusCode: number = 422) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class InsufficientStockError extends DomainError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'InsufficientStockError';
  }
}
