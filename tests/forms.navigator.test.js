import test from "node:test";
import assert from "node:assert/strict";

import { loadFormSchema } from "../app/forms/loader.js";
import { computeProgress, getNextRequiredField, getVisibleFields } from "../app/forms/navigator.js";

const schema = loadFormSchema("example_form");

test("getVisibleFields hides conditional field when condition is false", () => {
  const visible = getVisibleFields(schema, { has_coapplicant: false });
  assert.equal(visible.some((f) => f.key === "coapplicant_name"), false);
});

test("computeProgress counts visible fields", () => {
  const progress = computeProgress(schema, {
    full_name: "Jane Public",
    email: "jane@example.com",
    has_coapplicant: false,
    filing_type: "standard"
  });

  assert.equal(progress.total >= 4, true);
  assert.equal(progress.required_filled >= 4, true);
});

test("getNextRequiredField returns first missing required visible field", () => {
  const next = getNextRequiredField(schema, {
    full_name: "Jane Public",
    email: "jane@example.com"
  });

  assert.ok(next);
  assert.equal(next.key, "has_coapplicant");
});
