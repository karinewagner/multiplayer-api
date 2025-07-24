import { DomainError } from './domain.error';

export class ValidationError extends DomainError {
  constructor(message = 'Erro de validação.') {
    super(message, 400);
  }
}
