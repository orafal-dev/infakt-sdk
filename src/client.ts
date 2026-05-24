import { createApiKeyHeaders } from "./auth/api-key.js";
import type { InfaktClientConfig } from "./client.types.js";
import { InfaktApiError, InfaktError } from "./errors/infakt-error.js";
import type {
  InfaktApiResponse,
  InfaktJsonEnvelope,
  InfaktRequestOptions,
} from "./types/common.types.js";
import {
  extractApiPayload,
  extractErrorMessage,
  extractMetaInfo,
} from "./json/parser.js";
import { parseJsonBody, serializeJsonBody } from "./json/serializer.js";

export const DEFAULT_BASE_URL = "https://api.infakt.pl/api/v3";
export const SANDBOX_BASE_URL = "https://api.sandbox-infakt.pl/api/v3";

const SUCCESS_STATUS_CODES = new Set([200, 201, 202, 204]);

export class InfaktClient {
  readonly baseUrl: string;

  private readonly credentials: InfaktClientConfig["credentials"];
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent?: string;

  constructor(config: InfaktClientConfig) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.credentials = config.credentials;
    this.fetchImpl = config.fetch ?? fetch;
    this.userAgent = config.userAgent;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options: InfaktRequestOptions & {
      body?: Record<string, unknown> | string;
    } = {},
  ): Promise<InfaktApiResponse<T>> {
    const url = this.buildUrl(path, options);
    const headers = this.buildHeaders(method, options.body);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        body: this.serializeBody(options.body),
        signal: options.signal,
      });
    } catch (error) {
      throw new InfaktError(
        error instanceof Error ? error.message : "Network request failed",
        { statusCode: 0 },
      );
    }

    const rawBody = await response.text();
    const parsed = rawBody
      ? (parseJsonBody(rawBody) as InfaktJsonEnvelope)
      : ({} as InfaktJsonEnvelope);

    if (!SUCCESS_STATUS_CODES.has(response.status)) {
      throw new InfaktApiError(extractErrorMessage(parsed, response.status), {
        statusCode: response.status,
        message: extractErrorMessage(parsed, response.status),
        errors: parsed.errors,
        rawBody,
      });
    }

    return {
      statusCode: response.status,
      data: extractApiPayload(parsed) as T,
      metainfo: extractMetaInfo(parsed),
      rawBody,
    };
  }

  private buildUrl(path: string, options: InfaktRequestOptions): string {
    const normalizedPath = path.replace(/^\//, "");
    const url = new URL(`${this.baseUrl}/${normalizedPath}`);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null) {
          continue;
        }
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  private buildHeaders(
    method: string,
    body?: Record<string, unknown> | string,
  ): Headers {
    const headers = new Headers(createApiKeyHeaders(this.credentials));

    if (this.userAgent) {
      headers.set("User-Agent", this.userAgent);
    }

    headers.set("Accept", "application/json");

    if (body !== undefined && method !== "GET" && method !== "DELETE") {
      headers.set("Content-Type", "application/json; charset=UTF-8");
    }

    return headers;
  }

  private serializeBody(
    body?: Record<string, unknown> | string,
  ): string | undefined {
    return serializeJsonBody(body);
  }
}
