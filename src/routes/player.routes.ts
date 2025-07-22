import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { validatePlayer } from '../middlewares/player.validator.middleware';

const router = Router();

router.get('/', PlayerController.getPlayersList);
router.post('/', validatePlayer, PlayerController.createPlayer);
router.get('/:id', PlayerController.getPlayerById);
router.put('/:id', PlayerController.updatePlayerById);
router.delete('/:id', PlayerController.deletePlayerById);

export default router;
