export { InfaktClient, DEFAULT_BASE_URL, SANDBOX_BASE_URL } from "./client.js";
export type { InfaktClientConfig } from "./client.types.js";

export { createApiKeyHeaders } from "./auth/api-key.js";
export type {
  ApiKeyAuthHeaders,
  ApiKeyCredentials,
} from "./auth/api-key.types.js";

export { InfaktApiError, InfaktError } from "./errors/infakt-error.js";

export { wrapResourcePayload, serializeJsonBody, parseJsonBody } from "./json/serializer.js";
export {
  extractApiPayload,
  extractErrorMessage,
  extractMetaInfo,
} from "./json/parser.js";
export type { InfaktJsonEnvelope } from "./json/parser.js";

export type {
  InfaktApiResponse,
  InfaktMetaInfo,
  InfaktQueryParams,
  InfaktRequestOptions,
  ListParameters,
} from "./types/common.types.js";

export { createInfaktModules, InfaktModules } from "./modules/index.js";
export { ResourceClient } from "./modules/resource-client.js";
export {
  RESOURCE_DEFINITIONS,
  type ResourceAction,
  type ResourceDefinition,
  type ResourceName,
} from "./modules/resources.generated.js";
