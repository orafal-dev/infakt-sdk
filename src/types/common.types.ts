export type InfaktQueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export type InfaktRequestOptions = {
  query?: InfaktQueryParams;
  signal?: AbortSignal;
};

export type InfaktMetaInfo = {
  count?: number;
  total_count?: number;
  next?: string | null;
  previous?: string | null;
};

export type InfaktApiResponse<T = unknown> = {
  statusCode: number;
  data: T;
  metainfo?: InfaktMetaInfo;
  rawBody: string;
};

export type ListParameters = {
  offset?: number;
  limit?: number;
  order?: string;
  fields?: string | string[];
  q?: Record<string, string | number | boolean>;
};

export type InfaktJsonEnvelope = {
  metainfo?: InfaktMetaInfo;
  entities?: unknown[];
  error?: string;
  errors?: unknown;
  [key: string]: unknown;
};
