import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';

const router = Router();

router.get('/', PlayerController.getAll);
router.post('/', PlayerController.create);
router.get('/:id', PlayerController.getById);
router.put('/:id', PlayerController.update);
router.delete('/:id', PlayerController.remove);

export default router;
