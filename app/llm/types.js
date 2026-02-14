function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export const LLM_OUTPUT_SCHEMA_JSON = {
  type: "object",
  additionalProperties: false,
  required: ["assistant_message", "updates", "needs_clarification", "safety_flags"],
  properties: {
    assistant_message: { type: "string" },
    updates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "value", "confidence"],
        properties: {
          key: { type: "string" },
          value: {},
          confidence: { type: "number", minimum: 0, maximum: 1 },
          reason: { type: "string" }
        }
      }
    },
    needs_clarification: { type: "boolean" },
    clarification_question: { type: "string" },
    safety_flags: {
      type: "array",
      items: { type: "string" }
    }
  }
};

function validateUpdate(update, idx, errors) {
  if (!isObject(update)) {
    errors.push(`updates[${idx}] must be an object`);
    return;
  }

  const allowed = new Set(["key", "value", "confidence", "reason"]);
  for (const key of Object.keys(update)) {
    if (!allowed.has(key)) {
      errors.push(`updates[${idx}] contains unknown property '${key}'`);
    }
  }

  if (typeof update.key !== "string" || !update.key.trim()) {
    errors.push(`updates[${idx}].key must be a non-empty string`);
  }

  if (typeof update.confidence !== "number" || update.confidence < 0 || update.confidence > 1) {
    errors.push(`updates[${idx}].confidence must be a number between 0 and 1`);
  }

  if ("reason" in update && typeof update.reason !== "string") {
    errors.push(`updates[${idx}].reason must be a string`);
  }
}

export function validateLLMStructuredOutput(value) {
  const errors = [];

  if (!isObject(value)) {
    return { valid: false, errors: ["response must be an object"] };
  }

  const allowedTop = new Set([
    "assistant_message",
    "updates",
    "needs_clarification",
    "clarification_question",
    "safety_flags"
  ]);
  for (const key of Object.keys(value)) {
    if (!allowedTop.has(key)) errors.push(`unknown top-level property '${key}'`);
  }

  if (typeof value.assistant_message !== "string") {
    errors.push("assistant_message must be a string");
  }

  if (!Array.isArray(value.updates)) {
    errors.push("updates must be an array");
  } else {
    value.updates.forEach((u, idx) => validateUpdate(u, idx, errors));
  }

  if (typeof value.needs_clarification !== "boolean") {
    errors.push("needs_clarification must be boolean");
  }

  if ("clarification_question" in value && typeof value.clarification_question !== "string") {
    errors.push("clarification_question must be a string when provided");
  }

  if (!Array.isArray(value.safety_flags) || value.safety_flags.some((f) => typeof f !== "string")) {
    errors.push("safety_flags must be an array of strings");
  }

  return { valid: errors.length === 0, errors };
}

function extractResponseText(response) {
  if (response && typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  if (Array.isArray(response?.output)) {
    for (const out of response.output) {
      if (!Array.isArray(out?.content)) continue;
      for (const content of out.content) {
        if (typeof content?.text === "string" && content.text.trim()) {
          return content.text;
        }
      }
    }
  }

  return "";
}

export function parseAndValidateStructuredOutput(response) {
  const rawText = extractResponseText(response);
  if (!rawText) {
    throw new Error("Model returned empty structured output.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Model returned non-JSON structured output.");
  }

  const result = validateLLMStructuredOutput(parsed);
  if (!result.valid) {
    throw new Error(`Model structured output failed validation: ${result.errors.join("; ")}`);
  }

  return parsed;
}
