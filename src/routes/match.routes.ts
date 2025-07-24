import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { validateMatch } from "../middlewares/validate-match.middleware";
import { validateFinishMatch } from '../middlewares/validate-finish.middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Matches
 *   description: Endpoints relacionados às partidas
 */

/**
 * @openapi
 * /matches:
 *   get:
 *     summary: Lista todas as partidas
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Lista de partidas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
router.get('/', MatchController.getAllMatches);

/**
 * @openapi
 * /matches:
 *   post:
 *     summary: Cria uma nova partida
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatch'
 *     responses:
 *       201:
 *         description: Partida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Dados inválidos
 */
router.post('/', validateMatch, MatchController.createNewMatch);

/**
 * @openapi
 * /matches/open:
 *   get:
 *     summary: Lista todas as partidas abertas (WAITING)
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Lista de partidas abertas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
router.get('/open', MatchController.getOpenMatches);

/**
 * @openapi
 * /matches/history/{playerId}:
 *   get:
 *     summary: Histórico de partidas de um jogador
 *     tags: [Matches]
 *     parameters:
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Histórico de partidas do jogador retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *       404:
 *         description: Jogador não encontrado
 */
router.get('/history/:playerId', MatchController.getPlayerHistory);

/**
 * @openapi
 * /matches/{matchId}/join/{playerId}:
 *   post:
 *     summary: Adiciona um jogador a uma partida
 *     tags: [Matches]
 *     parameters:
 *       - name: matchId
 *         in: path
 *         required: true
 *         description: ID da partida
 *         schema:
 *           type: string
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jogador adicionado à partida com sucesso
 *       404:
 *         description: Partida ou jogador não encontrado
 */
router.post('/:matchId/join/:playerId', MatchController.addPlayerToMatch);

/**
 * @openapi
 * /matches/{matchId}/leave/{playerId}:
 *   post:
 *     summary: Remove um jogador de uma partida
 *     tags: [Matches]
 *     parameters:
 *       - name: matchId
 *         in: path
 *         required: true
 *         description: ID da partida
 *         schema:
 *           type: string
 *       - name: playerId
 *         in: path
 *         required: true
 *         description: ID do jogador
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jogador removido da partida com sucesso
 *       404:
 *         description: Partida ou jogador não encontrado
 */
router.post('/:matchId/leave/:playerId', MatchController.removePlayerFromMatch);

/**
 * @openapi
 * /matches/{matchId}/start:
 *   post:
 *     summary: Inicia uma partida
 *     tags: [Matches]
 *     parameters:
 *       - name: matchId
 *         in: path
 *         required: true
 *         description: ID da partida
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partida iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         description: Partida não encontrada
 *       400:
 *         description: Erro ao iniciar a partida
 */
router.post('/:matchId/start', MatchController.startMatchById);

/**
 * @openapi
 * /matches/{matchId}/finish:
 *   post:
 *     summary: Finaliza uma partida com os scores dos jogadores
 *     tags: [Matches]
 *     parameters:
 *       - name: matchId
 *         in: path
 *         required: true
 *         description: ID da partida
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinishMatch'
 *     responses:
 *       200:
 *         description: Partida finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         description: Partida não encontrada
 *       400:
 *         description: Erro nos dados enviados
 */
router.post('/:matchId/finish', validateFinishMatch, MatchController.finishMatchById);

export default router;
