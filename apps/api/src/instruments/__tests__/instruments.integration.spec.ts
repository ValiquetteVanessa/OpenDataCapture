import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { ExceptionsFilter, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MockedInstance } from '@douglasneuroinformatics/nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { BPRS_SOURCE, EDQ_SOURCE, HQ_SOURCE, MMSE_SOURCE, MOCA_SOURCE } from '@open-data-capture/instruments';
import { Types } from 'mongoose';
import request from 'supertest';

import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';
import { createMockModelProvider } from '@/testing/testing.utils';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';
describe('/instruments', () => {
  let app: NestExpressApplication;
  let server: any;

  let instrumentModel: MockedInstance<Model<'Instrument'>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [InstrumentsService, createMockModelProvider('Instrument')]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new ValidationPipe());

    instrumentModel = app.get(getModelToken('Instrument'));
    await app.init();
    server = app.getHttpServer();
  });

  describe('POST /instruments', () => {
    it('should reject a request with an empty body', async () => {
      const response = await request(server).post('/instruments').send();
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should reject a request where name is an empty string', async () => {
      const source = HQ_SOURCE.replace("name: 'HappinessQuestionnaire'", "name: ''");
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should reject a request with an invalid language', async () => {
      const source = HQ_SOURCE.replace("language: ['en', 'fr']", 'language: -1');
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should reject a request if one of the language translations is missing', async () => {
      const source = HQ_SOURCE.replace("fr: 'Questionnaire sur le bonheur'", '');
      const response = await request(server).post('/instruments').send({ source });
      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('should return status code 201 when attempting to create the BPRS', async () => {
      const response = await request(server).post('/instruments').send({ source: BPRS_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the enhanced demographics questionnaire', async () => {
      const response = await request(server).post('/instruments').send({ source: EDQ_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the happiness questionnaire', async () => {
      const response = await request(server).post('/instruments').send({ source: HQ_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MMSE', async () => {
      const response = await request(server).post('/instruments').send({ source: MMSE_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
    it('should return status code 201 when attempting to create the MoCA', async () => {
      const response = await request(server).post('/instruments').send({ source: MOCA_SOURCE });
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('GET /instruments', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/instruments');
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return all the instruments returned by the repository', async () => {
      instrumentModel.findMany.mockResolvedValueOnce([{ id: 1, kind: 'FORM' }]);
      const response = await request(server).get('/instruments');
      expect(response.body).toMatchObject([{ id: 1 }]);
    });
  });

  describe('GET /instruments/:id', () => {
    let id: string;
    beforeAll(() => {
      id = new Types.ObjectId().toString();
    });
    it('should return status code 200 with a valid ID', async () => {
      instrumentModel.findFirst.mockResolvedValueOnce({ id, kind: 'FORM' });
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should throw a not found exception if the instrument does not exist', async () => {
      instrumentModel.findFirst.mockResolvedValueOnce(null);
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should return the instrument if it exists', async () => {
      instrumentModel.findFirst.mockResolvedValueOnce({ id, kind: 'FORM' });
      const response = await request(server).get(`/instruments/${id}`);
      expect(response.body).toMatchObject({ id });
    });
  });

  // describe('PATCH /instruments/:id', () => {
  //   let id: string;
  //   beforeAll(() => {
  //     id = new Types.ObjectId().toString();
  //   });

  //   it('should reject a request with an invalid id', async () => {
  //     const response = await request(server).patch('/instruments/123');
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should reject a request to set the instrument name to an empty string', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: '' });
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should reject a request to set the instrument name to a number', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: 100 });
  //     expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  //   });
  //   it('should return status code 200 with a valid ID, even if nothing is modified', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`);
  //     expect(response.status).toBe(HttpStatus.OK);
  //   });
  //   it('should return status code 200 with a valid ID and valid data', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: 'foo' });
  //     expect(response.status).toBe(HttpStatus.OK);
  //   });
  //   it('should return the modified instrument', async () => {
  //     instrumentsRepository.findById.mockResolvedValueOnce({ id, kind: 'FORM' });
  //     instrumentsRepository.updateById.mockImplementationOnce((id: string, obj: object) => ({ id, ...obj }));
  //     const response = await request(server).patch(`/instruments/${id}`).send({ name: 'foo' });
  //     expect(response.body).toMatchObject({ name: 'foo' });
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});
