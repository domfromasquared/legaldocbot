import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".json", ".yaml", ".yml"]);
const cache = new Map();

function parseSchemaText(filePath, raw) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return JSON.parse(raw);
  }

  // YAML 1.2 accepts JSON; this keeps parsing dependency-free.
  return JSON.parse(raw);
}

function assertFormShape(schema, filePath) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new Error(`Invalid schema in ${filePath}: top-level object required.`);
  }

  const requiredTop = ["id", "title", "jurisdiction", "version", "fields"];
  for (const key of requiredTop) {
    if (!(key in schema)) {
      throw new Error(`Invalid schema in ${filePath}: missing '${key}'.`);
    }
  }

  if (!Array.isArray(schema.fields)) {
    throw new Error(`Invalid schema in ${filePath}: 'fields' must be an array.`);
  }

  for (const field of schema.fields) {
    if (!field || typeof field !== "object") {
      throw new Error(`Invalid schema in ${filePath}: each field must be an object.`);
    }
    for (const key of ["key", "label", "type", "required"]) {
      if (!(key in field)) {
        throw new Error(`Invalid schema in ${filePath}: field missing '${key}'.`);
      }
    }
  }
}

function readSchemaFromFile(filePath) {
  const stat = fs.statSync(filePath);
  const cached = cache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.schema;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = parseSchemaText(filePath, raw);
  assertFormShape(parsed, filePath);

  cache.set(filePath, { mtimeMs: stat.mtimeMs, schema: parsed });
  return parsed;
}

function getFormDir(formDir) {
  return formDir || path.resolve(process.cwd(), "forms");
}

function findSchemaFileById(formId, formDir) {
  const root = getFormDir(formDir);
  const entries = fs.existsSync(root) ? fs.readdirSync(root) : [];

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
    if (path.basename(entry, ext) === formId) {
      return path.join(root, entry);
    }
  }

  return null;
}

export function loadFormSchema(formId, { formDir } = {}) {
  const filePath = findSchemaFileById(formId, formDir);
  if (!filePath) {
    throw new Error(`Form schema '${formId}' not found.`);
  }

  const schema = readSchemaFromFile(filePath);
  if (schema.id !== formId) {
    throw new Error(`Form id mismatch for '${formId}': file schema id is '${schema.id}'.`);
  }
  return schema;
}

export function listFormSchemas({ formDir } = {}) {
  const root = getFormDir(formDir);
  if (!fs.existsSync(root)) return [];

  const out = [];
  for (const entry of fs.readdirSync(root)) {
    const ext = path.extname(entry).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const schema = readSchemaFromFile(path.join(root, entry));
    out.push({
      id: schema.id,
      title: schema.title,
      jurisdiction: schema.jurisdiction,
      version: schema.version,
      path: entry
    });
  }

  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export function clearSchemaCache() {
  cache.clear();
}
