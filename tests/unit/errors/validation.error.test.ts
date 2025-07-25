import { ValidationError } from '../../../src/errors/validation.error';
import { DomainError } from '../../../src/errors/domain.error';

describe('ValidationError', () => {
  it('deve instanciar com a mensagem padrão', () => {
    const error = new ValidationError();

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);

    expect(error.message).toBe('Erro de validação.');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
    expect(error.stack).toBeDefined();
  });

  it('deve aceitar uma mensagem customizada', () => {
    const error = new ValidationError('Campo "email" é obrigatório');

    expect(error.message).toBe('Campo "email" é obrigatório');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });
});
