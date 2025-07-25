# 🎮 Multiplayer API

Uma API REST para gerenciar partidas multiplayer, permitindo efetuar o CRUD de jogadores, criar partidas, adicionar/remover jogadores, iniciar e finalizar partidas com pontuações.

---

## **📌 Tecnologias**
- **Node.js**
- **Express**
- **TypeScript**
- **Prisma ORM**
- **Postgres**
- **Swagger UI**
- **Jest**

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
 ├── controllers/    # Controllers das requisições HTTP
 ├── database/       # Instância e configuração de conexão com o banco de dados
 ├── erros/          # Middlewares para tratamento de erros
 ├── middlewares/    # Middlewares para validações e tratamento de requisições
 ├── repositories/   # Acesso ao banco via Prisma
 ├── routes/         # Definições das rotas
 ├── services/       # Contém a lógica de negócio
 ├── types/          # Arquivos de tipagem 
 ├── app.ts          # Configuração principal do servidor
prisma/
 ├── migrations/     # Histórico das migrações aplicadas ao banco
 ├── schema.prisma   # Definição do schema do banco de dados
tests/
 ├── integration/    # Testes de integração
 ├── unit/           # Testes unitários
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
Este projeto incorpora práticas de DevOps ao integrar uma pipeline de Integração Contínua e Entrega Contínua (CI/CD). A cada novo commit no repositório, o pipeline executa os testes (unitário e de integração) e atualizações, disponibilizando automaticamente uma nova versão da API na plataforma Render. Isso elimina a necessidade de execução local e garante entregas rápidas, confiáveis e rastreáveis.

🔗 Swagger: **https://multiplayer-api.onrender.com/api-docs/**

>OBS: Como a API está hospedada em uma plataforma gratuita (Render), a instância pode entrar em modo de hibernação após um período de inatividade. Nesse caso, o primeiro acesso pode levar alguns segundos para que o serviço seja reativado. Aguarde até o carregamento completo da página.
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
## **📖 Cobertura de testes**
Abaixo está o relatório de cobertura de testes gerado automaticamente, demonstrando a abrangência dos testes unitários e de integração implementados no projeto:

![Relatório de Cobertura de Testes](./assets/cobertura-testes.png)

> A cobertura é verificada a cada execução da pipeline CI/CD, garantindo a confiabilidade contínua do código.
---

## **📜 Licença**
Este projeto é de uso livre para estudo e melhorias.
