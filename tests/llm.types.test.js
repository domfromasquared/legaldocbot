import test from "node:test";
import assert from "node:assert/strict";

import {
  parseAndValidateStructuredOutput,
  validateLLMStructuredOutput
} from "../app/llm/types.js";

test("validateLLMStructuredOutput accepts valid payload", () => {
  const payload = {
    assistant_message: "Thanks. What is your filing date?",
    updates: [{ key: "full_name", value: "Jane Public", confidence: 0.94 }],
    needs_clarification: true,
    clarification_question: "What is the filing date?",
    safety_flags: []
  };

  const result = validateLLMStructuredOutput(payload);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("validateLLMStructuredOutput rejects unknown keys", () => {
  const payload = {
    assistant_message: "ok",
    updates: [],
    needs_clarification: false,
    safety_flags: [],
    unexpected: true
  };

  const result = validateLLMStructuredOutput(payload);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /unknown top-level property/i);
});

test("parseAndValidateStructuredOutput parses response.output_text", () => {
  const response = {
    output_text: JSON.stringify({
      assistant_message: "Acknowledged.",
      updates: [{ key: "email", value: "a@b.com", confidence: 0.8, reason: "User stated email" }],
      needs_clarification: false,
      safety_flags: []
    })
  };

  const parsed = parseAndValidateStructuredOutput(response);
  assert.equal(parsed.assistant_message, "Acknowledged.");
  assert.equal(parsed.updates.length, 1);
});

test("parseAndValidateStructuredOutput throws on invalid JSON", () => {
  assert.throws(
    () => parseAndValidateStructuredOutput({ output_text: "not-json" }),
    /non-JSON structured output/i
  );
});
