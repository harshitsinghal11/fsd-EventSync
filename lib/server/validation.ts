export function getTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function getOptionalTrimmedString(value: unknown): string | null {
  const trimmed = getTrimmedString(value);
  return trimmed.length > 0 ? trimmed : null;
}

export function getRequiredFieldsError(fields: Record<string, string>): string | null {
  const missingFields = Object.entries(fields)
    .filter(([, value]) => value.length === 0)
    .map(([label]) => label);

  if (missingFields.length === 0) {
    return null;
  }

  if (missingFields.length === 1) {
    return `${capitalize(missingFields[0])} is required.`;
  }

  if (missingFields.length === 2) {
    return `${capitalize(missingFields[0])} and ${missingFields[1]} are required.`;
  }

  return `Missing required fields: ${missingFields.join(', ')}.`;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
