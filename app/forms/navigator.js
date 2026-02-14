import { evaluateCondition, isFieldVisible } from "./validator.js";

export function getVisibleFields(schema, answers) {
  const fields = schema?.fields || [];
  return fields.filter((f) => isFieldVisible(f, answers || {}));
}

function isMissing(value) {
  return value == null || value === "";
}

function isRequired(field, answers) {
  return !!field.required || (!!field.required_if && evaluateCondition(field.required_if, answers || {}));
}

export function computeProgress(schema, answers) {
  const visible = getVisibleFields(schema, answers);
  const totalVisible = visible.length;

  const filledVisible = visible.filter((f) => !isMissing(answers?.[f.key])).length;
  const requiredVisible = visible.filter((f) => isRequired(f, answers));
  const requiredFilled = requiredVisible.filter((f) => !isMissing(answers?.[f.key])).length;

  return {
    filled: filledVisible,
    total: totalVisible,
    percent: totalVisible > 0 ? Math.round((filledVisible / totalVisible) * 100) : 0,
    required_filled: requiredFilled,
    required_total: requiredVisible.length
  };
}

export function getNextRequiredField(schema, answers) {
  const visible = getVisibleFields(schema, answers);
  for (const field of visible) {
    if (isRequired(field, answers) && isMissing(answers?.[field.key])) {
      return {
        key: field.key,
        label: field.label,
        type: field.type,
        help: field.help || "",
        examples: Array.isArray(field.examples) ? field.examples : []
      };
    }
  }
  return null;
}
