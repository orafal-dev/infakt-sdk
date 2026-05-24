import type { InfaktClient } from "../client.js";
import { ResourceClient } from "./resource-client.js";
import {
  RESOURCE_DEFINITIONS,
  type ResourceName,
} from "./resources.generated.js";

export class InfaktModules {
  private readonly clients = new Map<ResourceName, ResourceClient>();

  constructor(private readonly client: InfaktClient) {}

  resource(name: ResourceName): ResourceClient {
    const existing = this.clients.get(name);
    if (existing) {
      return existing;
    }

    const definition = RESOURCE_DEFINITIONS[name];
    const resourceClient = new ResourceClient(this.client, definition);
    this.clients.set(name, resourceClient);
    return resourceClient;
  }
}

export const createInfaktModules = (client: InfaktClient): InfaktModules =>
  new InfaktModules(client);

export type { ResourceName };
