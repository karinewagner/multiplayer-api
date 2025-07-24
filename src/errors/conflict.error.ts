import { DomainError } from './domain.error';

export class ConflictError extends DomainError {
  constructor(message = 'Conflito de recurso.') {
    super(message, 409);
  }
}
