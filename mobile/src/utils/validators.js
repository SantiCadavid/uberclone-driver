// AI-assisted: see docs/AI_LOG.md #6
// Pure functions: each returns an error message (string) or null when the value is valid
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRequired(value, message = 'Este campo es obligatorio.') {
  if (value === null || value === undefined) return message;
  if (typeof value === 'string' && value.trim() === '') return message;
  return null;
}

export function validateEmail(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!EMAIL_REGEX.test(value.trim())) {
    return 'Ingresa un correo válido (ej. nombre@dominio.com).';
  }
  return null;
}