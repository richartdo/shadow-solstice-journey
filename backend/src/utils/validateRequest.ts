import { z } from "zod";

const choiceSchema = z.object({
  sceneTitle: z.string().trim().min(1).max(120),
  choiceText: z.string().trim().min(1).max(300),
  lightPoints: z.number().int().min(-100).max(100),
  shadowPoints: z.number().int().min(-100).max(100),
}).strict();

export const generateEndingSchema = z.object({
  sessionId: z.string().uuid(),
  playerName: z.string().trim().min(1).max(80),
  lightScore: z.number().int().min(0).max(10_000),
  shadowScore: z.number().int().min(0).max(10_000),
  endingType: z.string().trim().min(1).max(120),
  choices: z.array(choiceSchema).min(1).max(30),
}).strict();

export type GenerateEndingRequest = z.infer<typeof generateEndingSchema>;

export function validateGenerateEndingRequest(input: unknown): GenerateEndingRequest {
  return generateEndingSchema.parse(input);
}
