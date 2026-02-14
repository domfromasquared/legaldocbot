import test from "node:test";
import assert from "node:assert/strict";

import { loadFormSchema } from "../app/forms/loader.js";
import { applyUpdates, validateAnswers } from "../app/forms/validator.js";

const schema = loadFormSchema("example_form");

test("validateAnswers rejects unknown fields", () => {
  const result = validateAnswers(schema, { unknown_key: "x" });
  assert.equal(result.valid, false);
  assert.match(result.errors.map((e) => e.message).join("\n"), /unknown field/i);
});

test("validateAnswers enforces required_if and pattern", () => {
  const result = validateAnswers(schema, {
    full_name: "Jane Public",
    email: "invalid-email",
    has_coapplicant: true
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.map((e) => `${e.key}:${e.message}`).join("\n"), /email:has invalid format/i);
  assert.match(result.errors.map((e) => `${e.key}:${e.message}`).join("\n"), /coapplicant_name:required field is missing/i);
});

test("applyUpdates merges and validates updates", () => {
  const result = applyUpdates(
    schema,
    { full_name: "Jane Public", has_coapplicant: false },
    [{ key: "email", value: "jane@example.com", confidence: 0.9 }]
  );

  assert.equal(result.valid, false); // filing_type is still required
  assert.equal(result.answers.email, "jane@example.com");
});
