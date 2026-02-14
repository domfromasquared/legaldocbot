import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { clearSchemaCache, listFormSchemas, loadFormSchema } from "../app/forms/loader.js";

function mkTempFormsDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "legaldocbot-forms-"));
  return dir;
}

test("loadFormSchema loads a valid schema by id", () => {
  clearSchemaCache();
  const schema = loadFormSchema("example_form", { formDir: path.resolve(process.cwd(), "forms") });
  assert.equal(schema.id, "example_form");
  assert.equal(Array.isArray(schema.fields), true);
  assert.equal(schema.fields.length > 0, true);
});

test("listFormSchemas returns metadata", () => {
  clearSchemaCache();
  const list = listFormSchemas({ formDir: path.resolve(process.cwd(), "forms") });
  assert.equal(list.length >= 1, true);
  const example = list.find((i) => i.id === "example_form");
  assert.ok(example);
  assert.equal(example.title, "Example Intake Form");
});

test("loadFormSchema rejects missing schema", () => {
  clearSchemaCache();
  assert.throws(
    () => loadFormSchema("does_not_exist", { formDir: path.resolve(process.cwd(), "forms") }),
    /not found/
  );
});

test("loadFormSchema enforces id consistency", () => {
  clearSchemaCache();
  const tempDir = mkTempFormsDir();

  fs.writeFileSync(
    path.join(tempDir, "mismatch.yaml"),
    JSON.stringify({
      id: "different_id",
      title: "Mismatch",
      jurisdiction: "US",
      version: "1.0.0",
      fields: [{ key: "x", label: "X", type: "string", required: true }]
    })
  );

  assert.throws(() => loadFormSchema("mismatch", { formDir: tempDir }), /id mismatch/i);
});
