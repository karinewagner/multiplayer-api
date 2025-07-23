# 🎮 Multiplayer API

Uma API REST para gerenciar partidas multiplayer, permitindo cadastrar jogadores, criar partidas, adicionar/remover jogadores, iniciar e finalizar partidas com pontuações.

---

## **📌 Tecnologias**
- **Node.js**
- **Express**
- **TypeScript**
- **Prisma ORM**
- **Postgres**
- **Swagger UI**

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
 ├── config/         # Configuração Swagger
 ├── controllers/    # Lida com as requisições HTTP
 ├── database/       # Instância e configuração de conexão com o banco de dados
 ├── middlewares/    # Middlewares para validações e tratamento de requisições
 ├── repositories/   # Acesso ao banco via Prisma
 ├── routes/         # Definições das rotas
 ├── services/       # Contém a lógica de negócio
 ├── app.ts          # Configuração principal do servidor
prisma/
 ├── migrations/     # Histórico das migrações aplicadas ao banco
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
Cria um arquivo `.env` na raiz do projeto:
```env
cp .env.example .env
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

O Swagger estará disponível em:  
**http://localhost:3000/api-docs**

---
## **🌐 API hospedada (Render)**
Você pode acessar a API pronta sem rodar nada localmente:

🔗 Swagger: **https://sua-api-no-render.onrender.com/api-docs**

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

## **📖 Documentação**
- [Prisma ORM](https://www.prisma.io/docs/)
- [Express](https://expressjs.com/)

---

## **📜 Licença**
Este projeto é de uso livre para estudo e melhorias.
