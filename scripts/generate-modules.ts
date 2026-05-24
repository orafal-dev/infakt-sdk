import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type PostmanItem = {
  name?: string;
  request?: {
    method?: string;
    url?: string | { raw?: string };
  };
  item?: PostmanItem[];
};

type ActionDef = {
  method: string;
  pathTemplate: string;
  wrapPayload?: boolean;
  requiresId?: boolean;
};

type ResourceDefinition = {
  name: string;
  pathPrefix: string;
  singularName: string;
  actions: Record<string, ActionDef>;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const collectionPath = join(__dirname, "../postman/collection.json");
const outputPath = join(__dirname, "../src/modules/resources.generated.ts");

const WRAP_ACTIONS = new Set(["create", "update"]);

const toSingular = (resource: string): string => {
  const base = resource.split("/").pop() ?? resource;

  if (base.endsWith("ies")) {
    return `${base.slice(0, -3)}y`;
  }

  if (base.endsWith("s")) {
    return base.slice(0, -1);
  }

  return base;
};

const normalizePath = (rawUrl: string): string =>
  rawUrl
    .replace(/\{\{host\}\}\/?/g, "")
    .replace(/https:\/\/api\.(sandbox-)?infakt\.pl\/api\/v3\/?/gi, "")
    .replace(/^\//, "")
    .split("?")[0]
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "{id}")
    .replace(/\{\{[^}]*\}\}?/g, "{id}")
    .replace(/\/\//g, "/{id}/")
    .replace(/\/\.\//g, "/{id}/")
    .replace(/\/\.json$/i, "/{id}.json")
    .replace(/\s+/g, "")
    .replace(/\/+$/g, "");

const toPathTemplate = (path: string): string =>
  path
    .split("/")
    .map((segment) => (segment === "." ? "{id}" : segment))
    .join("/");

const inferAction = (
  path: string,
  method: string,
): { action: string; requiresId: boolean } => {
  const idCrudMatch = path.match(/\/\{id\}\.json$/i);
  if (idCrudMatch) {
    if (method === "GET") {
      return { action: "get", requiresId: true };
    }
    if (method === "PUT" || method === "PATCH") {
      return { action: "update", requiresId: true };
    }
    if (method === "DELETE") {
      return { action: "delete", requiresId: true };
    }
    return { action: method.toLowerCase(), requiresId: true };
  }

  const idActionMatch = path.match(/\/\{id\}\/(.+)\.json$/i);
  if (idActionMatch) {
    const action = idActionMatch[1]!.replace(/\//g, "_");
    return { action, requiresId: true };
  }

  const segments = path.split("/");
  const last = segments[segments.length - 1]!;

  if (last.endsWith(".json")) {
    const resourceFile = last.replace(/\.json$/i, "");
    if (segments.length === 1) {
      if (method === "GET") {
        return { action: "list", requiresId: false };
      }
      if (method === "POST") {
        return { action: "create", requiresId: false };
      }
      return { action: method.toLowerCase(), requiresId: false };
    }

    if (resourceFile === "next_number") {
      return { action: "next_number", requiresId: false };
    }

    return { action: resourceFile, requiresId: false };
  }

  return { action: `${method.toLowerCase()}_${last}`, requiresId: false };
};

const parsePathPrefix = (path: string): string => {
  const idCrudMatch = path.match(/^(.+)\/\{id\}\.json$/i);
  if (idCrudMatch) {
    return idCrudMatch[1]!;
  }

  const idActionMatch = path.match(/^(.+)\/\{id\}\//i);
  if (idActionMatch) {
    return idActionMatch[1]!;
  }

  const segments = path.split("/");
  const last = segments[segments.length - 1]!;

  if (last.endsWith(".json")) {
    const resourceFile = last.replace(/\.json$/i, "");
    if (segments.length === 1) {
      return resourceFile;
    }

    const prefixSegments = segments.slice(0, -1).filter((segment) => segment !== ".");

    if (resourceFile === "next_number") {
      return prefixSegments.join("/");
    }

    return [...prefixSegments, resourceFile].join("/");
  }

  return segments.join("/");
};

const actionKey = (action: string, method: string): string => {
  if (action === "list" || action === "create" || action === "get" || action === "update" || action === "delete") {
    return action;
  }

  return `${action}__${method.toLowerCase()}`;
};

const parseResources = (items: PostmanItem[]): Map<string, ResourceDefinition> => {
  const resources = new Map<string, ResourceDefinition>();

  const walk = (nodes: PostmanItem[]) => {
    for (const node of nodes) {
      if (node.request) {
        const rawUrl =
          typeof node.request.url === "string"
            ? node.request.url
            : node.request.url?.raw;

        if (!rawUrl || !node.request.method) {
          continue;
        }

        const path = normalizePath(rawUrl);
        const method = node.request.method.toUpperCase();
        const pathPrefix = parsePathPrefix(path);
        const { action, requiresId } = inferAction(path, method);
        const key = actionKey(action, method);

        if (!resources.has(pathPrefix)) {
          resources.set(pathPrefix, {
            name: pathPrefix,
            pathPrefix,
            singularName: toSingular(pathPrefix),
            actions: {},
          });
        }

        const entry = resources.get(pathPrefix)!;
        entry.actions[key] = {
          method,
          pathTemplate: toPathTemplate(path),
          wrapPayload: WRAP_ACTIONS.has(action),
          requiresId,
        };
      }

      if (node.item?.length) {
        walk(node.item);
      }
    }
  };

  walk(items);
  return resources;
};

const collection = JSON.parse(readFileSync(collectionPath, "utf8")) as {
  item: PostmanItem[];
};

const resources = [...parseResources(collection.item).values()].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const resourceNames = resources.map((resource) => resource.name);
const allActions = [
  ...new Set(resources.flatMap((resource) => Object.keys(resource.actions))),
].sort();

const file = `/* eslint-disable */
/* auto-generated by scripts/generate-modules.ts — do not edit manually */

export type ResourceAction = ${allActions.map((action) => `"${action}"`).join(" | ")};

export type ResourceName = ${resourceNames.map((name) => `"${name}"`).join(" | ")};

export type ActionDef = {
  method: string;
  pathTemplate: string;
  wrapPayload?: boolean;
  requiresId?: boolean;
};

export type ResourceDefinition = {
  name: ResourceName;
  pathPrefix: string;
  singularName: string;
  actions: Record<string, ActionDef>;
};

export const RESOURCE_DEFINITIONS: Record<ResourceName, ResourceDefinition> = ${JSON.stringify(
  Object.fromEntries(resources.map((resource) => [resource.name, resource])),
  null,
  2,
)} as Record<ResourceName, ResourceDefinition>;
`;

writeFileSync(outputPath, file);
console.log(`Generated ${resources.length} resources -> ${outputPath}`);
