// AI-assisted: see docs/AI_LOG.md #17
// Error with an HTTP status and a short code the app can translate into a message
export class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}