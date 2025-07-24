import { validateFinishMatch } from '../../../src/middlewares/validate-finish.middleware';
import { ValidationError } from '../../../src/errors/validation.error';

describe('Middleware: validateFinishMatch', () => {
  const mockNext = jest.fn();
  const mockRes = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir seguir quando scores está presente e válido', () => {
    const mockReq = {
      body: {
        scores: {
          'player-1': 10,
          'player-2': 5,
        },
      },
    } as any;

    validateFinishMatch(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('deve lançar ValidationError se scores estiver ausente', () => {
    const mockReq = {
      body: {},
    } as any;

    expect(() => validateFinishMatch(mockReq, mockRes, mockNext)).toThrow(ValidationError);
    expect(() => validateFinishMatch(mockReq, mockRes, mockNext)).toThrow('Os scores são obrigatórios para finalizar a partida.');
  });

  it('deve lançar ValidationError se scores não for um objeto', () => {
    const mockReq = {
      body: { scores: 'invalid' },
    } as any;

    expect(() => validateFinishMatch(mockReq, mockRes, mockNext)).toThrow(ValidationError);
  });

  it('deve lançar ValidationError se scores for um objeto vazio', () => {
    const mockReq = {
      body: { scores: {} },
    } as any;

    expect(() => validateFinishMatch(mockReq, mockRes, mockNext)).toThrow(ValidationError);
  });
});
