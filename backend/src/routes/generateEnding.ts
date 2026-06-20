import { Router } from "express";
import { ZodError } from "zod";
import { AiServiceError, generateAiEnding } from "../services/aiService.js";
import {
  assertSessionOwner,
  authenticateAccessToken,
  AuthenticationError,
  saveEnding,
  SessionNotFoundError,
} from "../services/supabaseService.js";
import { validateGenerateEndingRequest } from "../utils/validateRequest.js";

export const generateEndingRouter = Router();

generateEndingRouter.post("/", async (request, response, next) => {
  try {
    const input = validateGenerateEndingRequest(request.body);
    const userId = await authenticateAccessToken(request.header("Authorization"));
    await assertSessionOwner(input.sessionId, userId);
    const ending = await generateAiEnding(input);
    await saveEnding(input.sessionId, ending, userId);
    response.status(200).json({ success: true, ending });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        success: false,
        error: "Invalid request body.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    if (error instanceof SessionNotFoundError) {
      response.status(404).json({ success: false, error: error.message });
      return;
    }
    if (error instanceof AuthenticationError) {
      response.status(401).json({ success: false, error: error.message });
      return;
    }
    if (error instanceof AiServiceError) {
      response.status(error.statusCode).json({ success: false, error: error.message });
      return;
    }
    next(error);
  }
});
