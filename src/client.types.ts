import type { ApiKeyCredentials } from "./auth/api-key.types.js";

export type InfaktClientConfig = {
  credentials: ApiKeyCredentials;
  baseUrl?: string;
  fetch?: typeof fetch;
  userAgent?: string;
};
