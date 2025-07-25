import { DomainError } from '../../../src/errors/domain.error';

describe('DomainError', () => {
  it('deve instanciar com mensagem e statusCode padrão', () => {
    const error = new DomainError('Erro genérico');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);

    expect(error.message).toBe('Erro genérico');
    expect(error.statusCode).toBe(400); // padrão
    expect(error.name).toBe('DomainError');
    expect(error.stack).toBeDefined();
  });

  it('deve aceitar e retornar um statusCode customizado', () => {
    const error = new DomainError('Erro de permissão', 403);

    expect(error.message).toBe('Erro de permissão');
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe('DomainError');
  });
});
