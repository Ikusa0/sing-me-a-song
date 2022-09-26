import { recommendationRepository } from "../../src/repositories/recommendationRepository"
import { recommendationService } from "../../src/services/recommendationsService"
import * as recommendationFactory from "./factories/recommendationFactory"

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
});

describe("Create Recommendations", () => {
  it("Success at creating recommendations", async () => {
    const newRecommendation = recommendationFactory.CreateRecommendation();

    jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null);
    jest.spyOn(recommendationRepository, "create").mockResolvedValueOnce(null);

    const promise = recommendationService.insert(newRecommendation);

    expect(promise).resolves.not.toThrow();
  })

  it("Conflict at creating recommendation", async () => {
    const newRecommendation = recommendationFactory.CreateRecommendation();
    const expectedDbRecommendation = recommendationFactory.CreateDBRecommendation(newRecommendation.name);

    jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(expectedDbRecommendation);

    const promise = recommendationService.insert(newRecommendation);

    expect(promise).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique" });
  })
})

describe("Increase recommendation score", () => {
  it("Success at upvoting", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation();
    const expectedRecommendation = { ...recommendation, score: recommendation.score + 1 };

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);
    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(expectedRecommendation)

    const promise = recommendationService.upvote(recommendation.id);

    expect(promise).resolves.not.toThrow();
  })

  it("Upvoting: id not found", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation();

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

    const promise = recommendationService.upvote(recommendation.id);

    expect(promise).rejects.toEqual({ type: "not_found", message: "" });
  })
})

describe("Decrease recommendation score", () => {
  it("Sucess at downvoting - Without removing", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation();
    const expectedRecommendation = { ...recommendation, score: recommendation.score - 1 };

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);
    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(expectedRecommendation);

    const promise = recommendationService.downvote(recommendation.id);

    expect(promise).resolves.not.toThrow();
  })

  it("Sucess at downvoting - Removing", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation(undefined, undefined, -5);
    const expectedRecommendation = { ...recommendation, score: recommendation.score - 1 };

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);
    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(expectedRecommendation);
    jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(null);

    const promise = recommendationService.downvote(recommendation.id);

    expect(promise).resolves.not.toThrow();
  })

  it("Downvoting: id not found", () => {
    const recommendation = recommendationFactory.CreateDBRecommendation();

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

    const promise = recommendationService.downvote(recommendation.id);

    expect(promise).rejects.toEqual({ type: "not_found", message: "" });
  })
})

describe("Get all recommendations", () => {
  it("Success at getting all recommendations", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation()
    const expectedArray = [recommendation];

    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(expectedArray);

    const promise = recommendationService.get();

    expect(promise).resolves.not.toThrow();
  })
})

describe("Get recommendations ordered by score", () => {
  it("Success at getting recommendations by score", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation()
    const expectedArray = [recommendation];

    jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce(expectedArray);

    const promise = recommendationService.getTop(1);

    expect(promise).resolves.not.toThrow();
  })
})

describe("Get random recommendations", () => {
  it("Success at getting random recommendation - gt", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation()
    const expectedArray = [recommendation];

    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.28711308119281376)
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(expectedArray);

    const result = await recommendationService.getRandom();

    expect(result).toEqual(recommendation);
  });

  it("Success at getting random recommendation - lte", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation()
    const expectedArray = [recommendation];

    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.78711308119281376)
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(expectedArray);

    const result = await recommendationService.getRandom();

    expect(result).toEqual(recommendation);
  })

  it("Failed to get random by score (but still get a random recommendation)", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation()
    const expectedArray = [recommendation];

    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.78711308119281376)
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(expectedArray);

    const result = await recommendationService.getRandom();

    expect(result).toEqual(recommendation);
  })

  it("Error by getting a random recommendation: empty database", async () => {
    const recommendation = recommendationFactory.CreateDBRecommendation()
    const expectedArray = [recommendation];

    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.78711308119281376)
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

    const promise = recommendationService.getRandom();

    expect(promise).rejects.toEqual({ type: "not_found", message: "" });
  })
})
