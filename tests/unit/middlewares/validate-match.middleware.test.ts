import { validateMatch } from '../../../src/middlewares/validate-match.middleware';
import { ValidationError } from '../../../src/errors/validation.error';

describe('Middleware: validateMatch', () => {
  const mockNext = jest.fn();
  const mockRes = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir seguir quando o nome da partida é válido', () => {
    const mockReq = {
      body: { name: 'Partida Teste' },
    } as any;

    validateMatch(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('deve lançar erro se o nome estiver ausente', () => {
    const mockReq = {
      body: {},
    } as any;

    expect(() => validateMatch(mockReq, mockRes, mockNext)).toThrow(ValidationError);
    expect(() => validateMatch(mockReq, mockRes, mockNext)).toThrow('O nome da partida é obrigatório.');
  });

  it('deve lançar erro se o nome não for uma string', () => {
    const mockReq = {
      body: { name: 123 },
    } as any;

    expect(() => validateMatch(mockReq, mockRes, mockNext)).toThrow(ValidationError);
  });

  it('deve lançar erro se o nome for uma string vazia', () => {
    const mockReq = {
      body: { name: '   ' },
    } as any;

    expect(() => validateMatch(mockReq, mockRes, mockNext)).toThrow(ValidationError);
  });
});
