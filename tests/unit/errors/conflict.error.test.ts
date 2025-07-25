import { ConflictError } from '../../../src/errors/conflict.error';
import { DomainError } from '../../../src/errors/domain.error';

describe('ConflictError', () => {
  it('deve instanciar corretamente com a mensagem padrão', () => {
    const error = new ConflictError();

    expect(error).toBeInstanceOf(ConflictError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);

    expect(error.message).toBe('Conflito de recurso.');
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('ConflictError');
  });

  it('deve aceitar mensagem customizada', () => {
    const error = new ConflictError('Este e-mail já está em uso.');

    expect(error.message).toBe('Este e-mail já está em uso.');
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('ConflictError');
  });
});
