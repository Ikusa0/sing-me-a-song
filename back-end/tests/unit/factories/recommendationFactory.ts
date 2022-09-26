import { faker } from "@faker-js/faker"

export function CreateRecommendation(name?: string) {
  return {
    name: name || faker.random.alphaNumeric(16),
    youtubeLink: "https://www.youtube.com/watch?v=199PRNiERmI",
    score: faker.datatype.number({ min: 0, max: 100 })
  }
}

export function CreateDBRecommendation(name?: string, youtubeLink?: string, score?: number) {
  return {
    id: faker.datatype.number({ min: 1 }),
    name: name || faker.random.alphaNumeric(16),
    youtubeLink: youtubeLink || "https://www.youtube.com/watch?v=199PRNiERmI",
    score: score || faker.datatype.number({ min: 0, max: 100 })
  }
}
