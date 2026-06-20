import cors from "cors";
import dotenv from "dotenv";
import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import { generateEndingRouter } from "./routes/generateEnding.js";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const app = express();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/u, ""))
  .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be a valid TCP port.");
}

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/u, ""))) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use(
  "/api/generate-ending",
  rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, error: "Too many requests. Please try again shortly." },
  }),
  generateEndingRouter,
);

app.use((_request, response) => {
  response.status(404).json({ success: false, error: "Route not found." });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  if (error instanceof Error && error.message === "Origin is not allowed by CORS.") {
    response.status(403).json({ success: false, error: "Origin is not allowed." });
    return;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({ success: false, error: "Invalid JSON request body." });
    return;
  }
  response.status(500).json({ success: false, error: "An unexpected server error occurred." });
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Shadow of Choices API listening on http://localhost:${port}`);
});
