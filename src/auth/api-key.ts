import type { ApiKeyAuthHeaders, ApiKeyCredentials } from "./api-key.types.js";

export const createApiKeyHeaders = (
  credentials: ApiKeyCredentials,
): ApiKeyAuthHeaders => ({
  "X-inFakt-ApiKey": credentials.apiKey,
});

export type { ApiKeyAuthHeaders, ApiKeyCredentials };
