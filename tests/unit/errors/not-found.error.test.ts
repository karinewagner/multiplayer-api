import { NotFoundError } from '../../../src/errors/not-found.error';
import { DomainError } from '../../../src/errors/domain.error';

describe('NotFoundError', () => {
  it('deve instanciar com a mensagem padrão', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);

    expect(error.message).toBe('Recurso não encontrado.');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
    expect(error.stack).toBeDefined();
  });

  it('deve aceitar uma mensagem customizada', () => {
    const error = new NotFoundError('Jogador não encontrado');

    expect(error.message).toBe('Jogador não encontrado');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });
});
