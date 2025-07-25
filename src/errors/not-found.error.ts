import { DomainError } from './domain.error';

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404);
  }
}
