import express from 'express';
import playerRoutes from './routes/player.routes';
import matchRoutes from './routes/match.routes';

const app = express();
app.use(express.json());

// Rotas
app.use('/players', playerRoutes);
app.use('/matches', matchRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
