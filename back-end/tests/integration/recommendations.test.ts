import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { CreateRecommendation, InsertRecommendation } from "./factories/recommendationFactory"

const ROUTE = "/recommendations";

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "recommendations";`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /", () => {
  it("Returns 201 for recommendation created", async () => {
    const body = CreateRecommendation();
    const result = await supertest(app).post(ROUTE).send(body);
    const { status } = result;

    const recommendationCreated = await recommendationRepository.findByName(body.name);

    expect(status).toEqual(201);
    expect(recommendationCreated).not.toBeNull();
  })

  it("Returns 422 for incorrect body", async () => {
    const body = CreateRecommendation();
    delete body.youtubeLink;

    const result = await supertest(app).post(ROUTE).send(body);
    const { status } = result;

    const recommendationCreated = await recommendationRepository.findByName(body.name);

    expect(status).toEqual(422);
    expect(recommendationCreated).toBeNull();
  })

  it("Returns 409 for conflicting recommendations", async () => {
    const body = await InsertRecommendation();
    delete body.id;
    delete body.score;

    const result = await supertest(app).post(ROUTE).send(body);
    const { status } = result;

    expect(status).toEqual(409);
  })
})

describe("GET /", () => {
  it("Returns 200 for success at getting recommendations - should return an array", async () => {
    const result = await supertest(app).get(ROUTE);
    const { status } = result;
    const { body } = result;

    expect(status).toEqual(200);
    expect(Array.isArray(body)).toBe(true);
  })
})

describe("GET /random", () => {
  it("Returns 200 for success at getting recommendations - should return an array", async () => {
    await InsertRecommendation();

    const result = await supertest(app).get(`${ROUTE}/random`);
    const { status } = result;
    const { body } = result;

    expect(status).toEqual(200);
    expect(typeof body).toBe('object');
  })

  it("Returns 404 for empty database", async () => {
    const result = await supertest(app).get(`${ROUTE}/random`);
    const { status } = result;

    expect(status).toEqual(404);
  })
})

describe("GET /top/:amount", () => {
  it("Returns 200 for success at getting recommendations - should return an array", async () => {
    const result = await supertest(app).get(`${ROUTE}/top/10`);
    const { status } = result;
    const { body } = result;

    expect(status).toEqual(200);
    expect(Array.isArray(body)).toBe(true);
  })

  it("Returns 500 for non-numeric parameter", async () => {
    const result = await supertest(app).get(`${ROUTE}/top/abc`);
    const { status } = result;

    expect(status).toEqual(500);
  })
})

describe("GET /:id", () => {
  it("Returns 200 for success at getting recommendation by id", async () => {
    const recommendation = await InsertRecommendation();
    const result = await supertest(app).get(`${ROUTE}/${recommendation.id}`);
    const { status } = result;
    const { body } = result;

    expect(status).toEqual(200);
    expect(typeof body).toBe('object');
  })

  it("Returns 500 for non-numeric parameter", async () => {
    const result = await supertest(app).get(`${ROUTE}/abc`);
    const { status } = result;

    expect(status).toEqual(500);
  })
})

describe("POST /:id/upvote", () => {
  it("Returns 200 for success at upvoting a recommendation", async () => {
    const recommendation = await InsertRecommendation();
    const result = await supertest(app).post(`${ROUTE}/${recommendation.id}/upvote`);
    const { status } = result;

    const updatedScore = await recommendationRepository.find(recommendation.id);

    expect(status).toEqual(200);
    expect(updatedScore.score).toEqual(recommendation.score + 1);
  })

  it ("Returns 404 for a inexistent recommendation", async () => {
    const result = await supertest(app).post(`${ROUTE}/0/upvote`);
    const { status } = result;

    expect(status).toEqual(404);
  })

  it ("Returns 500 for a non-numeric parameter", async () => {
    const result = await supertest(app).post(`${ROUTE}/abc/upvote`);
    const { status } = result;

    expect(status).toEqual(500);
  })
})

describe("POST /:id/downvote", () => {
  it("Returns 200 for success at downvoting a recommendation", async () => {
    const recommendation = await InsertRecommendation();
    const result = await supertest(app).post(`${ROUTE}/${recommendation.id}/downvote`);
    const { status } = result;

    const updatedScore = await recommendationRepository.find(recommendation.id);

    expect(status).toEqual(200);
    expect(updatedScore.score).toEqual(recommendation.score - 1);
  })

  it ("Returns 404 for a inexistent recommendation", async () => {
    const result = await supertest(app).post(`${ROUTE}/0/downvote`);
    const { status } = result;

    expect(status).toEqual(404);
  })

  it ("Returns 500 for a non-numeric parameter", async () => {
    const result = await supertest(app).post(`${ROUTE}/abc/downvote`);
    const { status } = result;

    expect(status).toEqual(500);
  })
})
