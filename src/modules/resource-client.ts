import type { InfaktClient } from "../client.js";
import type {
  InfaktApiResponse,
  InfaktRequestOptions,
  ListParameters,
} from "../types/common.types.js";
import { wrapResourcePayload } from "../json/serializer.js";
import type { ResourceAction, ResourceDefinition } from "./resources.generated.js";

export type ResourceClientOptions = InfaktRequestOptions & {
  id?: string | number;
  body?: Record<string, unknown> | string;
  query?: Record<string, string | number | boolean | undefined | null>;
};

const buildListQuery = (params?: ListParameters) => {
  if (!params) {
    return undefined;
  }

  const query: Record<string, string | number | boolean> = {};

  if (params.offset !== undefined) {
    query.offset = params.offset;
  }
  if (params.limit !== undefined) {
    query.limit = params.limit;
  }
  if (params.order) {
    query.order = params.order;
  }
  if (params.fields !== undefined) {
    query.fields = Array.isArray(params.fields)
      ? params.fields.join(",")
      : params.fields;
  }
  if (params.q) {
    for (const [key, value] of Object.entries(params.q)) {
      query[`q[${key}]`] = value;
    }
  }

  return query;
};

const buildPath = (
  definition: ResourceDefinition,
  actionDef: ResourceDefinition["actions"][string],
  id?: string | number,
): string => {
  let path = actionDef.pathTemplate;

  if (path.includes("{id}")) {
    if (id === undefined) {
      throw new Error(
        `Action "${actionDef.pathTemplate}" on resource "${definition.name}" requires an id`,
      );
    }
    path = path.replace("{id}", String(id));
  }

  return path;
};

export class ResourceClient {
  constructor(
    private readonly client: InfaktClient,
    private readonly definition: ResourceDefinition,
  ) {}

  async invoke<T = unknown>(
    action: ResourceAction | string,
    options: ResourceClientOptions = {},
  ): Promise<InfaktApiResponse<T>> {
    const actionDef = this.definition.actions[action];
    if (!actionDef) {
      throw new Error(
        `Action "${action}" is not supported for resource "${this.definition.name}"`,
      );
    }

    const path = buildPath(this.definition, actionDef, options.id);

    let body = options.body;
    if (
      body &&
      typeof body === "object" &&
      actionDef.method !== "GET" &&
      actionDef.wrapPayload === true
    ) {
      body = wrapResourcePayload(this.definition.singularName, body);
    }

    return this.client.request<T>(actionDef.method, path, {
      ...options,
      body,
      query: {
        ...options.query,
      },
    });
  }

  list<T = unknown>(
    params?: ListParameters,
    options?: InfaktRequestOptions,
  ): Promise<InfaktApiResponse<T>> {
    return this.invoke<T>("list", {
      ...options,
      query: {
        ...buildListQuery(params),
        ...options?.query,
      },
    });
  }

  get<T = unknown>(
    id: string | number,
    options?: InfaktRequestOptions,
  ): Promise<InfaktApiResponse<T>> {
    return this.invoke<T>("get", { ...options, id });
  }

  create<T = unknown>(
    data: Record<string, unknown>,
    options?: InfaktRequestOptions,
  ): Promise<InfaktApiResponse<T>> {
    return this.invoke<T>("create", { ...options, body: data });
  }

  update<T = unknown>(
    id: string | number,
    data: Record<string, unknown>,
    options?: InfaktRequestOptions,
  ): Promise<InfaktApiResponse<T>> {
    return this.invoke<T>("update", { ...options, id, body: data });
  }

  delete<T = unknown>(
    id: string | number,
    options?: InfaktRequestOptions,
  ): Promise<InfaktApiResponse<T>> {
    return this.invoke<T>("delete", { ...options, id });
  }
}
