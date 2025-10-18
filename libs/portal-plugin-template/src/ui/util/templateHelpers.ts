// Utility functions for the template plugin

export function formatTemplateData(data: unknown): string {
  // Add your utility functions here
  return JSON.stringify(data, null, 2);
}

export function validateTemplateConfig(config: unknown): boolean {
  // Add validation logic here
  return true;
}

export function getTemplateErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}