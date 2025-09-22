import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('DummyJSON - Testes de Produtos', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dummyjson.com';
  let productId = 1; 
  const productName = faker.commerce.productName();

  p.request.setDefaultTimeout(30000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('CRUD de Produtos', () => {
    it('1. Deve simular a adição de um novo produto com sucesso (POST)', async () => {
      await p
        .spec()
        .post(`${baseUrl}/products/add`)
        .withHeaders('Content-Type', 'application/json')
        .withJson({
          title: productName,
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price()),
        })
        .expectStatus(StatusCodes.CREATED) 
        .expectJsonLike({
          title: productName
        });
    });

    it('2. Deve buscar um produto existente pelo ID (GET)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/${productId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('id', productId);
    });

    it('3. Deve simular a atualização de um produto (PUT)', async () => {
      const updatedTitle = `(UPDATED) ${productName}`;
      await p
        .spec()
        .put(`${baseUrl}/products/${productId}`)
        .withHeaders('Content-Type', 'application/json')
        .withJson({
          title: updatedTitle,
        })
        .expectStatus(StatusCodes.OK)
        .expectJson('title', updatedTitle);
    });
    
    it('4. Deve buscar produtos com um termo de pesquisa (GET com Query)', async () => {
        await p
          .spec()
          .get(`${baseUrl}/products/search`)
          .withQueryParams('q', 'phone')
          .expectStatus(StatusCodes.OK)
          .expect(ctx => {
            const { res } = ctx;
            if (!res.body.products || res.body.products.length === 0) {
              throw new Error('A busca não retornou produtos na lista.');
            }
          });
    });;

    it('5. Deve simular a deleção de um produto (DELETE)', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/products/${productId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('isDeleted', true)
        .expectJson('id', productId);
    });
  });
});