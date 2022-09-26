import { faker } from "@faker-js/faker"
import { prisma } from "../../../src/database";

export function CreateRecommendation(name?: string, youtubeLink?: string) {
  return {
    name: name || faker.random.alphaNumeric(16),
    youtubeLink: youtubeLink || "https://www.youtube.com/watch?v=199PRNiERmI",
  }
}

export async function InsertRecommendation() {
  const recommendation = CreateRecommendation();
  return await prisma.recommendation.create({ data: recommendation });
}