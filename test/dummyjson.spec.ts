import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('DummyJSON - Testes de Produtos', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dummyjson.com';
  let productId = 0;
  const productName = faker.commerce.productName();

  p.request.setDefaultTimeout(30000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('CRUD de Produtos', () => {
    it('1. Deve adicionar um novo produto com sucesso (POST)', async () => {
      const response = await p
        .spec()
        .post(`${baseUrl}/products/add`)
        .withHeaders('Content-Type', 'application/json')
        .withJson({
          title: productName,
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price()),
        })
        .expectStatus(StatusCodes.OK) 
        .expectJsonLike({
          title: productName
        });
        
      productId = response.json.id;
    });

    it('2. Deve buscar o produto recém-criado pelo ID (GET)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/${productId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('id', productId)
        .expectJson('title', productName);
    });

    it('3. Deve atualizar o produto recém-criado (PUT)', async () => {
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
    
    it('4. Deve buscar produtos com o termo atualizado (GET com Query)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/search`)
        .withQueryParams('q', 'UPDATED')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike('products[0].id', productId);
    });

    it('5. Deve deletar o produto recém-criado (DELETE)', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/products/${productId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('isDeleted', true)
        .expectJson('id', productId);
    });
  });
});