import { validatePlayer } from '../../../src/middlewares/validate-player.middleware';
import { ValidationError } from '../../../src/errors/validation.error';

describe('Middleware: validatePlayer', () => {
  const mockNext = jest.fn();
  const mockRes = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir seguir com dados válidos', () => {
    const mockReq = {
      body: {
        name: 'João da Silva',
        nickname: 'joaosilva',
        email: 'joao@email.com',
      },
    } as any;

    validatePlayer(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('deve lançar erro se o nome for inválido', () => {
    const mockReq = {
      body: {
        name: 'João123',
        nickname: 'joaozinho',
        email: 'joao@email.com',
      },
    } as any;

    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow(ValidationError);
    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow('Nome inválido. Use apenas letras e espaços.');
  });

  it('deve lançar erro se o nome estiver ausente', () => {
    const mockReq = {
      body: {
        nickname: 'joaozinho',
        email: 'joao@email.com',
      },
    } as any;

    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow(ValidationError);
  });

  it('deve lançar erro se o nickname estiver ausente ou vazio', () => {
    const mockReq = {
      body: {
        name: 'João',
        nickname: '',
        email: 'joao@email.com',
      },
    } as any;

    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow(ValidationError);
    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow('Nickname é obrigatório.');
  });

  it('deve lançar erro se o email for inválido', () => {
    const mockReq = {
      body: {
        name: 'João',
        nickname: 'joaosilva',
        email: 'email-invalido',
      },
    } as any;

    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow(ValidationError);
    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow('E-mail inválido.');
  });

  it('deve lançar erro se o email estiver ausente', () => {
    const mockReq = {
      body: {
        name: 'João',
        nickname: 'joaozinho',
      },
    } as any;

    expect(() => validatePlayer(mockReq, mockRes, mockNext)).toThrow(ValidationError);
  });
});
