/**
 * Utility function to sanitize errors and objects by replacing large base64 strings
 * with readable placeholders to keep console logs clean
 */
export function sanitizeForLogging(error: any): any {
  if (!error) return error;

  // Handle error objects
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeString(error.message),
      stack: error.stack ? sanitizeString(error.stack) : undefined,
    };
  }

  // Handle strings
  if (typeof error === "string") {
    return sanitizeString(error);
  }

  // Handle objects
  if (typeof error === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(error)) {
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else if (value instanceof Error) {
        sanitized[key] = sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return error;
}

/**
 * Replace large base64 strings in a string with a readable placeholder
 */
function sanitizeString(str: string): string {
  // Match base64 data URLs and replace with placeholder
  return str.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100,}/g, (match) => {
    const sizeKB = Math.round(match.length / 1024);
    return `[base64 image data - ${sizeKB}KB]`;
  });
}
