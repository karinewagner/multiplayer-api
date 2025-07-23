import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swaggerOptions';

import playerRoutes from './routes/player.routes';
import matchRoutes from './routes/match.routes';

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
