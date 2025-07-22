import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { validateMatch } from "../middlewares/match.validator.middleware";
import { validateFinishMatch } from '../middlewares/finish.validator.middleware';

const router = Router();

// CRUD básico de partidas
router.get('/', MatchController.getAllMatches);
router.post('/', validateMatch, MatchController.createNewMatch);
router.get('/open', MatchController.getOpenMatches);
router.get('/history/:playerId', MatchController.getPlayerHistory);

// Entrar/Sair da partida
router.post('/:matchId/join/:playerId', MatchController.addPlayerToMatch);
router.post('/:matchId/leave/:playerId', MatchController.removePlayerFromMatch);

// Iniciar/Finalizar partida
router.post('/:matchId/start', MatchController.startMatchById);
router.post('/:matchId/finish', validateFinishMatch, MatchController.finishMatchById);

export default router;
