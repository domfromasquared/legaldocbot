import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listFormSchemas, loadFormSchema } from "./app/forms/loader.js";
import { applyUpdates } from "./app/forms/validator.js";
import { computeProgress, getNextRequiredField } from "./app/forms/navigator.js";
import { openaiTranscribe, runPlainChat, runStructuredFormTurn } from "./app/llm/client.js";

dotenv.config();

const app = express();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment.");
  process.exit(1);
}

// ---------- Basic safety controls ----------
const rateBucket = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 90;

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || "unknown";
  const entry = rateBucket.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  entry.count += 1;
  rateBucket.set(key, entry);

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  }

  return next();
}

function redactPII(text) {
  if (!text) return "";
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g, "[REDACTED_PHONE]")
    .replace(/\b\d{1,6}\s+[A-Za-z0-9.\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd)\b/gi, "[REDACTED_ADDRESS]");
}

function logError(message, error) {
  const raw = error?.stack || error?.message || String(error);
  console.error(`${message}: ${redactPII(raw)}`);
}

function latestUserMessageText(messages) {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg?.role === "user" && typeof msg?.content === "string") {
      return msg.content;
    }
  }
  return "";
}

function isLegalAdviceRequest(text) {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return (
    normalized.includes("legal advice") ||
    normalized.includes("what should i do") ||
    normalized.includes("should i sue") ||
    normalized.includes("can i win") ||
    normalized.includes("best legal strategy")
  );
}

// ---------- Routes ----------
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(rateLimit);

app.get("/api/forms", (req, res) => {
  try {
    res.json({ forms: listFormSchemas() });
  } catch (e) {
    logError("Error listing forms", e);
    res.status(500).json({ error: "Unable to load forms." });
  }
});

app.post("/api/respond", async (req, res) => {
  try {
    const { messages, form_id: formId, answers } = req.body || {};
    const userText = latestUserMessageText(messages);

    if (isLegalAdviceRequest(userText)) {
      const outputText =
        "I can provide general document information, not legal advice. For strategy decisions, consider a licensed attorney or local legal aid resources.";

      return res.json({
        output_text: outputText,
        answers: answers || {},
        validation_errors: [],
        progress: null,
        next_field: null,
        raw: null
      });
    }

    if (!formId) {
      const result = await runPlainChat({
        apiKey: OPENAI_API_KEY,
        messages,
        model: "gpt-5.2"
      });
      return res.json(result);
    }

    const formSchema = loadFormSchema(formId);
    const llm = await runStructuredFormTurn({
      apiKey: OPENAI_API_KEY,
      model: "gpt-5.2",
      messages,
      formSchema,
      currentAnswers: answers || {}
    });

    const applied = applyUpdates(formSchema, answers || {}, llm.parsed.updates);
    const progress = computeProgress(formSchema, applied.answers);
    const nextField = getNextRequiredField(formSchema, applied.answers);

    const clarificationText =
      llm.parsed.needs_clarification && llm.parsed.clarification_question
        ? ` ${llm.parsed.clarification_question}`
        : "";
    const outputText = `${llm.parsed.assistant_message || ""}${clarificationText}`.trim();

    res.json({
      output_text: outputText,
      structured: llm.parsed,
      answers: applied.answers,
      validation_errors: applied.errors,
      progress,
      next_field: nextField,
      raw: llm.raw
    });
  } catch (e) {
    logError("Error handling /api/respond", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded." });

    const result = await openaiTranscribe({
      apiKey: OPENAI_API_KEY,
      fileBuffer: req.file.buffer,
      filename: req.file.originalname || "audio.webm",
      mimeType: req.file.mimetype || "audio/webm"
    });

    res.json({ text: result.text || "" });
  } catch (e) {
    logError("Error handling /api/transcribe", e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
