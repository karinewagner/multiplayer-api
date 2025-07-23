# 🎮 Multiplayer API

Uma API REST para gerenciar partidas multiplayer, permitindo cadastrar jogadores, criar partidas, adicionar/remover jogadores, iniciar e finalizar partidas com pontuações.

---

## **📌 Tecnologias**
- **Node.js**
- **Express**
- **Prisma ORM**
- **SQLite (banco de desenvolvimento)**
- **TypeScript**

---

## **🚀 Funcionalidades**
- **Jogadores (Players):**
  - Criar jogador.
  - Listar jogadores.
  - Buscar jogador por ID.
  - Atualizar informações de um jogador.
  - Remover jogador.

- **Partidas (Matches):**
  - Criar uma partida.
  - Listar partidas.
  - Adicionar até 4 jogadores em uma partida.
  - Remover jogadores de uma partida.
  - Iniciar uma partida.
  - Finalizar uma partida com pontuações (`scores`).

---

## **📂 Estrutura de Pastas**
```
src/
 ├── controllers/    # Lida com as requisições HTTP
 ├── database/       # Instância e configuração de conexão com o banco de dados
 ├── middlewares/    # Middlewares para validações e tratamento de requisições
 ├── repositories/   # Acesso ao banco via Prisma
 ├── routes/         # Definições das rotas
 ├── services/       # Contém a lógica de negócio
 ├── app.ts          # Configuração principal do servidor
prisma/
 ├── migrations/     # Histórico das migrações aplicadas ao banco
 ├── dev.db          # Banco de dados SQLite (ambiente de desenvolvimento)
 ├── schema.prisma   # Definição do schema do banco de dados
```

---

## **⚙️ Configuração do Ambiente**
### **1. Clonar o repositório**
```bash
git clone https://github.com/karinewagner/multiplayer-api.git
cd multiplayer-api
```

### **2. Instalar dependências**
```bash
npm install
```

### **3. Configurar variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto com:
```env
DATABASE_URL="file:./dev.db"
```

### **4. Configurar banco de dados**
Gerar o banco e as tabelas via Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

### **5. Rodar o servidor**
```bash
npm run dev
```
O servidor estará disponível em:  
**http://localhost:3000**

---

## **🧪 Rotas Principais**
### **Players**
- **POST** `/players` – Criar jogador.
- **GET** `/players` – Listar jogadores.
- **GET** `/players/:id` – Buscar jogador por ID.
- **PUT** `/players/:id` – Atualizar jogador.
- **DELETE** `/players/:id` – Remover jogador.

### **Matches**
- **POST** `/matches` – Criar partida.
- **POST** `/matches/:matchId/join/:playerId` – Adicionar jogador na partida.
- **POST** `/matches/:matchId/leave/:playerId` – Remover jogador da partida.
- **POST** `/matches/:matchId/start` – Iniciar a partida.
- **POST** `/matches/:matchId/finish` – Finalizar partida com `scores`

---

## **📝 Exemplo de Requisição com cURL**
### Criar um jogador:
```bash
curl -X POST http://localhost:3000/players \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "nickname": "joao", "email": "joao@email.com"}'
```

### Criar uma partida:
```bash
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"name": "Partida 1"}'
```

### Finalizar partida com scores:
```bash
curl -X POST http://localhost:3000/matches/{matchId}/finish \
  -H "Content-Type: application/json" \
  -d '{
    "scores": {
      "5f6efe32-8f48-4931-88f9-dcea8d485fb3": 5,
      "46eb914c-752f-4499-9bfd-4fd1dd2a473f": 10
    }
  }'
```

---

## **📖 Documentação**
- [Prisma ORM](https://www.prisma.io/docs/)
- [Express](https://expressjs.com/)

---

## **📜 Licença**
Este projeto é de uso livre para estudo e melhorias.
