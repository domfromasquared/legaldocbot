import express from "express";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment.");
  process.exit(1);
}

// ---------- OpenAI helpers ----------
async function openaiResponses({ model, input, schemaJson }) {
  const body = { model, input };

  if (schemaJson) {
    body.text = {
      format: {
        type: "json_schema",
        name: "response_schema",
        schema: schemaJson
      }
    };
  }

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI /responses error ${res.status}: ${errText}`);
  }

  return await res.json();
}

async function openaiTranscribe(fileBuffer, filename, mimeType) {
  const form = new FormData();
  form.append("model", "gpt-4o-mini-transcribe");
  form.append("file", new Blob([fileBuffer], { type: mimeType }), filename);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI /audio/transcriptions error ${res.status}: ${errText}`);
  }

  return await res.json();
}

// ---------- Routes ----------
app.post("/api/respond", async (req, res) => {
  try {
    const { messages } = req.body;

    const system = `
You are a legal document interview assistant.
You provide general information and drafting help only, not legal advice.
Do not claim documents are "ironclad" or guaranteed enforceable.
When user asks "what should I do", respond with neutral options and recommend consulting a lawyer.
Keep replies short, mobile-friendly, and ask one question at a time.
`;

    const input = [{ role: "system", content: system.trim() }, ...(messages || [])];

    const response = await openaiResponses({
      model: "gpt-5.2",
      input
    });

    res.json({
      output_text: response.output_text || "",
      raw: response
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded." });

    const result = await openaiTranscribe(
      req.file.buffer,
      req.file.originalname || "audio.webm",
      req.file.mimetype || "audio/webm"
    );

    res.json({ text: result.text || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
