import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Multiplayer',
      version: '1.0.0',
    },
    components: {
      schemas: {
        Player: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '5c5bf381-a793-4362-92e0-c02bbe1fd76a' },
            name: { type: 'string', example: 'Lis' },
            nickname: { type: 'string', example: 'lis' },
            email: { type: 'string', example: 'lis@email.com' },
            matchId: { type: 'string', nullable: true, example: 'ac2f747f-a133-4493-9e65-889321925296' },
          },
        },
        CreatePlayer: {
          type: 'object',
          required: ['name', 'nickname', 'email'],
          properties: {
            name: { type: 'string', example: 'Lis' },
            nickname: { type: 'string', example: 'lis' },
            email: { type: 'string', example: 'lis@email.com' },
          },
        },
        UpdatePlayer: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Novo Nome' },
            nickname: { type: 'string', example: 'novo_nick' },
            email: { type: 'string', example: 'novo@email.com' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'ac2f747f-a133-4493-9e65-889321925296' },
            name: { type: 'string', example: 'Partida 1' },
            state: { type: 'string', enum: ['WAITING', 'IN_PROGRESS', 'FINISHED'], example: 'IN_PROGRESS' },
            startDate: { type: 'string', format: 'date-time', example: '2025-07-22T20:19:46.499Z' },
            scores: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { '5c5bf381-a793-4362-92e0-c02bbe1fd76a': 25 },
            },
            players: {
              type: 'array',
              items: { $ref: '#/components/schemas/Player' },
            },
          },
        },
        CreateMatch: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Partida 1' },
          },
        },
        FinishMatch: {
          type: 'object',
          required: ['scores'],
          properties: {
            scores: {
              type: 'object',
              description: 'Mapeamento de playerId para score',
              example: {
                '5f6efe32-8f48-4931-88f9-dcea8d485fb3': 5,
                '46eb914c-752f-4499-9bfd-4fd1dd2a473f': 10,
              },
            },
          },
        },
      },
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
