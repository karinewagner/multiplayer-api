import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { validatePlayer } from '../middlewares/validate-player.middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Players
 *   description: Endpoints relacionados aos jogadores
 */

/**
 * @openapi
 * /players:
 *   get:
 *     summary: Lista todos os jogadores
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Lista de jogadores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 */
router.get('/', PlayerController.getPlayersList);

/**
 * @openapi
 * /players:
 *   post:
 *     summary: Cria um novo jogador
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlayer'
 *     responses:
 *       201:
 *         description: Jogador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Dados inválidos
 */
router.post('/', validatePlayer, PlayerController.createPlayer);

/**
 * @openapi
 * /players/{id}:
 *   get:
 *     summary: Busca um jogador pelo ID
 *     tags: [Players]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jogador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Jogador não encontrado
 */
router.get('/:id', PlayerController.getPlayerById);

/**
 * @openapi
 * /players/{id}:
 *   put:
 *     summary: Atualiza um jogador pelo ID
 *     tags: [Players]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlayer'
 *     responses:
 *       200:
 *         description: Jogador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Jogador não encontrado
 */
router.put('/:id', PlayerController.updatePlayerById);

/**
 * @openapi
 * /players/{id}:
 *   delete:
 *     summary: Remove um jogador pelo ID
 *     tags: [Players]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Jogador removido com sucesso
 *       404:
 *         description: Jogador não encontrado
 */
router.delete('/:id', PlayerController.deletePlayerById);

export default router;
