import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger-options';
import dotenv from 'dotenv';

import playerRoutes from './routes/player.routes';
import matchRoutes from './routes/match.routes';
import { DomainError } from './errors/domain.error';

dotenv.config();

const app = express();
app.use(express.json());

// Rotas
app.use('/players', playerRoutes);
app.use('/matches', matchRoutes);

// Rota para documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Middleware de tratamento de erros (deve ficar por último)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json({ error: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
