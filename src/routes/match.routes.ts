import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';

const router = Router();

// CRUD básico de partidas
router.get('/', MatchController.getAll);
router.post('/', MatchController.create);
router.get('/open', MatchController.getOpenMatches);
router.get('/history/:playerId', MatchController.getPlayerHistory);

// Entrar/Sair da partida
router.post('/:matchId/join/:playerId', MatchController.joinMatch);
router.post('/:matchId/leave/:playerId', MatchController.leaveMatch);

// Iniciar/Finalizar partida
router.post('/:matchId/start', MatchController.startMatch);
router.post('/:matchId/finish', MatchController.finishMatch);

export default router;
