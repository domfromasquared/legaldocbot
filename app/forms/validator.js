function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function evaluateCondition(condition, answers) {
  if (!condition) return true;
  if (!isObject(condition)) return false;

  const actual = answers?.[condition.key];
  if ("equals" in condition) return actual === condition.equals;
  if ("not_equals" in condition) return actual !== condition.not_equals;
  if ("in" in condition && Array.isArray(condition.in)) return condition.in.includes(actual);

  return false;
}

export function isFieldVisible(field, answers) {
  if (!field?.show_if) return true;
  return evaluateCondition(field.show_if, answers);
}

function validateType(field, value) {
  switch (field.type) {
    case "string":
    case "text":
      return typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
    case "integer":
    case "int":
      return Number.isInteger(value) || (typeof value === "string" && /^-?\d+$/.test(value));
    case "number":
      return typeof value === "number" || (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value));
    default:
      return true;
  }
}

function coerceValue(field, value) {
  if (value == null) return value;
  if ((field.type === "integer" || field.type === "int") && typeof value === "string") {
    return parseInt(value, 10);
  }
  if (field.type === "number" && typeof value === "string") {
    return parseFloat(value);
  }
  return value;
}

function validateRuleConstraints(field, value) {
  const errors = [];

  if (value == null || value === "") return errors;

  if (typeof value === "string") {
    if (field.min_length != null && value.length < field.min_length) {
      errors.push(`must be at least ${field.min_length} characters`);
    }
    if (field.max_length != null && value.length > field.max_length) {
      errors.push(`must be at most ${field.max_length} characters`);
    }
    if (field.pattern) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) errors.push("has invalid format");
    }
  }

  if (Array.isArray(field.enum) && !field.enum.includes(value)) {
    errors.push(`must be one of: ${field.enum.join(", ")}`);
  }

  if (typeof value === "number") {
    if (field.min != null && value < field.min) errors.push(`must be >= ${field.min}`);
    if (field.max != null && value > field.max) errors.push(`must be <= ${field.max}`);
  }

  return errors;
}

export function validateAnswers(schema, answers) {
  const errors = [];
  const merged = { ...(answers || {}) };
  const fields = schema?.fields || [];
  const fieldMap = new Map(fields.map((f) => [f.key, f]));

  const forbidUnknown = schema?.validation?.forbid_unknown_fields !== false;
  if (forbidUnknown) {
    for (const key of Object.keys(merged)) {
      if (!fieldMap.has(key)) {
        errors.push({ key, message: "unknown field" });
      }
    }
  }

  for (const field of fields) {
    const visible = isFieldVisible(field, merged);
    if (!visible) continue;

    const required = field.required || (field.required_if && evaluateCondition(field.required_if, merged));
    const rawValue = merged[field.key];

    if (required && (rawValue == null || rawValue === "")) {
      errors.push({ key: field.key, message: "required field is missing" });
      continue;
    }

    if (rawValue == null || rawValue === "") continue;

    if (!validateType(field, rawValue)) {
      errors.push({ key: field.key, message: `expected type ${field.type}` });
      continue;
    }

    const coerced = coerceValue(field, rawValue);
    merged[field.key] = coerced;

    const ruleErrors = validateRuleConstraints(field, coerced);
    for (const message of ruleErrors) {
      errors.push({ key: field.key, message });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    answers: merged
  };
}

export function applyUpdates(schema, answers, updates) {
  const next = { ...(answers || {}) };
  const updateErrors = [];

  for (const upd of updates || []) {
    if (!upd || typeof upd.key !== "string") {
      updateErrors.push({ key: "", message: "invalid update object" });
      continue;
    }
    next[upd.key] = upd.value;
  }

  const result = validateAnswers(schema, next);
  return {
    answers: result.answers,
    errors: [...updateErrors, ...result.errors],
    valid: updateErrors.length === 0 && result.valid
  };
}
