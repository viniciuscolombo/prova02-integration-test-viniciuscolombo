import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('ServeRest - Testes de Usuários', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://serverest.dev';
  let userId = '';
  const userEmail = faker.internet.email();
  const userPassword = faker.internet.password();

  p.request.setDefaultTimeout(30000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('CRUD de Usuários', () => {
    it('1. Deve cadastrar um novo usuário com sucesso (POST)', async () => {
      userId = await p
        .spec()
        .post(`${baseUrl}/usuarios`)
        .withJson({
          nome: faker.person.fullName(),
          email: userEmail,
          password: userPassword,
          administrador: 'true'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          message: 'Cadastro realizado com sucesso'
        })
        .returns('_id'); 
    });

    it('2. Deve buscar o usuário cadastrado pelo ID (GET)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/usuarios/${userId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          email: userEmail
        });
    });
    
    it('3. Deve listar todos os usuários cadastrados (GET)', async () => {
        await p
          .spec()
          .get(`${baseUrl}/usuarios`)
          .expectStatus(StatusCodes.OK)
          .expectJsonSchema({
            type: 'object',
            properties: {
                quantidade: { type: 'number' },
                usuarios: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            nome: { type: 'string' },
                            email: { type: 'string' },
                            password: { type: 'string' },
                            administrador: { type: 'string' },
                            _id: { type: 'string' }
                        },
                        required: ['nome', 'email', 'password', 'administrador', '_id']
                    }
                }
            }
          });
      });

    it('4. Deve editar o usuário recém-cadastrado (PUT)', async () => {
      const novoNome = faker.person.fullName();
      await p
        .spec()
        .put(`${baseUrl}/usuarios/${userId}`)
        .withJson({
          nome: novoNome,
          email: userEmail,
          password: userPassword,
          administrador: 'true'
        })
        .expectStatus(StatusCodes.OK)
        .expectJson({
          message: 'Registro alterado com sucesso'
        });
    });

    it('5. Deve excluir o usuário recém-cadastrado (DELETE)', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/usuarios/${userId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson({
          message: 'Registro excluído com sucesso'
        });
    });
  });
});